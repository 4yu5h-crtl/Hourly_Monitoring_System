import { Request, Response } from 'express';
import { OPCUAClient } from 'node-opcua';
import { query, getConnection } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { recalculateShiftMetrics } from './entriesController.js';
import 'dotenv/config.js';

const CH02_ENDPOINT_URL = process.env.OPC_CH02_ENDPOINT_URL || '';
const CH02_NODE_ID = process.env.OPC_CH02_NODE_ID || '';

interface KepwareReadResult {
  value: number;
  sourceTimestamp: Date;
  serverReceivedAt: Date;
  fallbackUsed: boolean;
}

export const getCumQty = async (_req: Request, res: Response) => {
  const client = OPCUAClient.create({ endpointMustExist: false });

  try {
    const read = await readCH02Value(client);
    res.json({
      success: true,
      value: read.value,
      timestamp: read.sourceTimestamp.toISOString(),
      sourceTimestamp: read.sourceTimestamp.toISOString(),
      serverReceivedAt: read.serverReceivedAt.toISOString(),
      fallbackUsed: read.fallbackUsed,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    try { await client.disconnect(); } catch (_e) {}
  }
};

// Fetch cumulative quantity from Kepware and store in exact shift-period by Kepware timestamp.
export const fetchAndStoreCumQty = async (req: Request, res: Response) => {
  const machine = (req.body?.machine || 'Control Room').trim();
  const channel = (req.body?.channel || 'CH-02').trim();

  try {
    const result = await processKepwareSync(machine, channel);
    res.json(result);
  } catch (error: any) {
    console.error(error);
    if (error.message === 'Target hourly slot was not found for the shift log') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

/**
 * Standalone function to fetch from Kepware and write to the database.
 * Used for both the API endpoint and the background chron/polling job.
 */
export const processKepwareSync = async (machine: string = 'Control Room', channel: string = 'CH-02') => {
  const client = OPCUAClient.create({ endpointMustExist: false });

  try {
    const read = await readCH02Value(client);
    const slotInfo = getShiftAndTimeSlotFromKepwareTimestamp(read.sourceTimestamp);

    const existingShift = await query(
      'SELECT id FROM shift_logs WHERE date = ? AND shift_id = ? AND machine = ? AND channel = ?',
      [slotInfo.shiftDate, slotInfo.shiftId, machine, channel]
    ) as any[];

    let shiftLogId = existingShift[0]?.id as string | undefined;
    if (!shiftLogId) {
      const conn = await getConnection();
      try {
        await conn.beginTransaction();

        // Double check within transaction
        const [[doubleCheckShift]] = await conn.execute(
          'SELECT id FROM shift_logs WHERE date = ? AND shift_id = ? AND machine = ? AND channel = ? FOR UPDATE',
          [slotInfo.shiftDate, slotInfo.shiftId, machine, channel]
        ) as any[];

        if (doubleCheckShift) {
          shiftLogId = doubleCheckShift.id;
        } else {
          shiftLogId = uuidv4();
          await conn.execute(
            'INSERT INTO shift_logs (id, date, shift_id, machine, channel) VALUES (?, ?, ?, ?, ?)',
            [shiftLogId, slotInfo.shiftDate, slotInfo.shiftId, machine, channel]
          );

          const timeSlots = getTimeSlots(slotInfo.shiftId);
          for (const slot of timeSlots) {
            const entryId = uuidv4();
            await conn.execute(
              'INSERT INTO hourly_entries (id, shift_log_id, time_slot) VALUES (?, ?, ?)',
              [entryId, shiftLogId, slot]
            );

            const lossId = uuidv4();
            await conn.execute(
              'INSERT INTO loss_details (id, hourly_entry_id) VALUES (?, ?)',
              [lossId, entryId]
            );
          }

          const summaryId = uuidv4();
          await conn.execute(
            'INSERT INTO production_summary (id, shift_log_id) VALUES (?, ?)',
            [summaryId, shiftLogId]
          );
        }
        await conn.commit();
      } catch (err: any) {
        await conn.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
          console.warn('Concurrent insert detected in processKepwareSync. Retrying fetch...');
          const [retryFetch] = await query(
            'SELECT id FROM shift_logs WHERE date = ? AND shift_id = ? AND machine = ? AND channel = ?',
            [slotInfo.shiftDate, slotInfo.shiftId, machine, channel]
          ) as any[];
          if (retryFetch) shiftLogId = retryFetch.id;
        } else {
          throw err;
        }
      } finally {
        conn.release();
      }
    }

    const entries = await query(
      'SELECT id, cum_qty FROM hourly_entries WHERE shift_log_id = ? AND time_slot = ?',
      [shiftLogId, slotInfo.timeSlot]
    ) as any[];

    if (!entries.length) {
      throw new Error('Target hourly slot was not found for the shift log');
    }

    const entryId = entries[0].id as string;
    await query(
      'UPDATE hourly_entries SET cum_qty = ?, edited = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [read.value, entryId]
    );

    // After updating cumulative quantity, securely trigger mathematical 
    // realignment of target hrly_qty and std_variance for the entire shift
    if (shiftLogId) {
      await recalculateShiftMetrics(shiftLogId);
    }

    return {
      success: true,
      value: read.value,
      timestamp: read.sourceTimestamp.toISOString(),
      sourceTimestamp: read.sourceTimestamp.toISOString(),
      serverReceivedAt: read.serverReceivedAt.toISOString(),
      fallbackUsed: read.fallbackUsed,
      shift: slotInfo.shiftId,
      shiftDate: slotInfo.shiftDate,
      timeSlot: slotInfo.timeSlot,
      shiftLogId,
      entryId,
      stored: true,
    };
  } finally {
    try { await client.disconnect(); } catch (_e) {}
  }
};

async function readCH02Value(client: OPCUAClient): Promise<KepwareReadResult> {
  if (!CH02_ENDPOINT_URL || !CH02_NODE_ID) {
    throw new Error('Missing OPC_CH02_ENDPOINT_URL or OPC_CH02_NODE_ID in environment configuration');
  }

  await client.connect(CH02_ENDPOINT_URL);
  const session = await client.createSession();

  try {
    const dataValue = await session.readVariableValue(CH02_NODE_ID);
    const serverReceivedAt = new Date();

    const rawValue = Number(dataValue?.value?.value);
    if (!Number.isFinite(rawValue)) {
      throw new Error('Kepware value is missing or non-numeric');
    }

    const sourceTimestamp = dataValue.sourceTimestamp instanceof Date
      ? dataValue.sourceTimestamp
      : serverReceivedAt;

    return {
      value: rawValue,
      sourceTimestamp,
      serverReceivedAt,
      fallbackUsed: !(dataValue.sourceTimestamp instanceof Date),
    };
  } finally {
    await session.close();
    await client.disconnect();
  }
}

function getShiftAndTimeSlotFromKepwareTimestamp(timestamp: Date): {
  shiftId: number;
  timeSlot: string;
  shiftDate: string;
} {
  const minutes = timestamp.getHours() * 60 + timestamp.getMinutes();

  const shift1Start = 6 * 60 + 54;
  const shift1End = 15 * 60 + 24; // inclusive (example: 07:54 in slot 1)
  const shift2Start = 15 * 60 + 24;
  const shift2End = 23 * 60 + 36;

  let shiftId = 3;
  let shiftDate = toDateOnly(timestamp);

  if (minutes >= shift1Start && minutes <= shift1End) {
    shiftId = 1;
  } else if (minutes >= shift2Start && minutes <= shift2End) {
    shiftId = 2;
  } else {
    shiftId = 3;
    // After midnight and before shift-1 start belongs to previous day's shift 3.
    if (minutes < shift1Start) {
      const prev = new Date(timestamp);
      prev.setDate(prev.getDate() - 1);
      shiftDate = toDateOnly(prev);
    }
  }

  const timeSlot = getTimeSlotForTimestamp(shiftId, timestamp);
  return { shiftId, timeSlot, shiftDate };
}

function getTimeSlotForTimestamp(shiftId: number, timestamp: Date): string {
  const currentTime = `${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}`;
  const timeSlots = getTimeSlots(shiftId);

  for (const slot of timeSlots) {
    const [startTime, endTime] = slot.split(' - ');
    if (isTimeBetweenInclusive(currentTime, startTime, endTime)) {
      return slot;
    }
  }

  return timeSlots[0];
}

function isTimeBetweenInclusive(currentTime: string, startTime: string, endTime: string): boolean {
  const current = convertToHHMM(currentTime);
  const start = convertToHHMM(startTime);
  const end = convertToHHMM(endTime);

  if (start <= end) {
    return current >= start && current <= end;
  }

  return current >= start || current <= end;
}

function convertToHHMM(timeValue: string): number {
  const match = timeValue.match(/(\d{1,2}):(\d{2})\s?(AM|PM)?/i);
  if (!match) return 0;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 100 + minutes;
}

function toDateOnly(date: Date): string {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 10);
}

function getTimeSlots(shiftId: number): string[] {
  const slots: Record<number, string[]> = {
    1: [
      '06:54 AM - 07:54 AM', '07:54 AM - 08:54 AM', '08:54 AM - 09:54 AM',
      '09:54 AM - 10:54 AM', '10:54 AM - 11:54 AM', '11:54 AM - 12:54 PM',
      '12:54 PM - 01:54 PM', '01:54 PM - 02:54 PM', '02:54 PM - 03:24 PM',
    ],
    2: [
      '03:24 PM - 04:24 PM', '04:24 PM - 05:24 PM', '05:24 PM - 06:24 PM',
      '06:24 PM - 07:24 PM', '07:24 PM - 08:24 PM', '08:24 PM - 09:24 PM',
      '09:24 PM - 10:24 PM', '10:24 PM - 11:36 PM',
    ],
    3: [
      '11:36 PM - 12:36 AM', '12:36 AM - 01:36 AM', '01:36 AM - 02:36 AM',
      '02:36 AM - 03:36 AM', '03:36 AM - 04:36 AM', '04:36 AM - 05:36 AM',
      '05:36 AM - 06:36 AM', '06:36 AM - 06:54 AM',
    ],
  };

  return slots[shiftId] || slots[1];
}
