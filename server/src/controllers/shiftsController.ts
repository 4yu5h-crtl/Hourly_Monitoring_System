import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection.js';

export const getShifts = async (req: Request, res: Response) => {
  try {
    const { date, shift, machine, channel } = req.query;

    let sql = 'SELECT * FROM shift_logs WHERE 1=1';
    const params: any[] = [];

    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    if (shift) {
      sql += ' AND shift_id = ?';
      params.push(shift);
    }
    if (machine) {
      sql += ' AND machine = ?';
      params.push(machine);
    }
    if (channel) {
      sql += ' AND channel = ?';
      params.push(channel);
    }

    sql += ' ORDER BY date DESC, shift_id';

    const results = await query(sql, params);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getShiftById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get shift log
    const logs = await query('SELECT * FROM shift_logs WHERE id = ?', [id]) as any[];
    if (!logs.length) {
      return res.status(404).json({ error: 'Shift log not found' });
    }
    const log = logs[0];

    // Get hourly entries
    const entries = await query('SELECT * FROM hourly_entries WHERE shift_log_id = ? ORDER BY created_at', [id]) as any[];

    // Get loss details for each entry
    let entriesWithLoss = await Promise.all(
      entries.map(async (entry) => {
        const lossData = await query('SELECT * FROM loss_details WHERE hourly_entry_id = ?', [entry.id]) as any[];
        return {
          ...entry,
          lossDetails: lossData[0] || {},
        };
      })
    );

    // Sort entries according to the chronological time slot sequence
    const timeSlots = getTimeSlots(log.shift_id);
    entriesWithLoss.sort((a, b) => {
      const indexA = timeSlots.indexOf(a.time_slot);
      const indexB = timeSlots.indexOf(b.time_slot);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    // Get summary
    const summaries = await query('SELECT * FROM production_summary WHERE shift_log_id = ?', [id]) as any[];

    res.json({
      ...log,
      entries: entriesWithLoss,
      summary: summaries[0] || {},
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrGetShift = async (req: Request, res: Response) => {
  try {
    const { date, shift_id: shiftId, machine, channel } = req.body;

    if (!date || !shiftId || !machine || !channel) {
      return res.status(400).json({
        error: 'Missing required fields: date, shift_id, machine, channel',
      });
    }

    // Validate inputs
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    if (![1, 2, 3].includes(shiftId)) {
      return res.status(400).json({ error: 'Invalid shift ID. Must be 1, 2, or 3' });
    }
    if (machine.length < 1 || machine.length > 100) {
      return res.status(400).json({ error: 'Machine name must be 1-100 characters' });
    }
    if (channel.length < 1 || channel.length > 100) {
      return res.status(400).json({ error: 'Channel name must be 1-100 characters' });
    }

    // Check if exists
    const results = await query(
      'SELECT * FROM shift_logs WHERE date = ? AND shift_id = ? AND machine = ? AND channel = ?',
      [date, shiftId, machine, channel]
    ) as any[];

    if (results.length > 0) {
      // Return existing shift with full data
      return res.json(results[0]);
    }

    // Create new shift log
    const id = uuidv4();
    await query(
      'INSERT INTO shift_logs (id, date, shift_id, machine, channel) VALUES (?, ?, ?, ?, ?)',
      [id, date, shiftId, machine, channel]
    );

    // Create empty entries and summary
    const timeSlots = getTimeSlots(shiftId);
    for (const slot of timeSlots) {
      const entryId = uuidv4();
      await query(
        'INSERT INTO hourly_entries (id, shift_log_id, time_slot) VALUES (?, ?, ?)',
        [entryId, id, slot]
      );

      // Create empty loss details
      const lossId = uuidv4();
      await query(
        'INSERT INTO loss_details (id, hourly_entry_id) VALUES (?, ?)',
        [lossId, entryId]
      );
    }

    // Create empty summary
    const summaryId = uuidv4();
    await query(
      'INSERT INTO production_summary (id, shift_log_id) VALUES (?, ?)',
      [summaryId, id]
    );

    res.status(201).json({ id, date, shift_id: shiftId, machine, channel });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

function getTimeSlots(shiftId: number): string[] {
  const slots: { [key: number]: string[] } = {
    1: [
      "06:54 AM - 07:54 AM", "07:54 AM - 08:54 AM", "08:54 AM - 09:54 AM",
      "09:54 AM - 10:54 AM", "10:54 AM - 11:54 AM", "11:54 AM - 12:54 PM",
      "12:54 PM - 01:54 PM", "01:54 PM - 02:54 PM", "02:54 PM - 03:24 PM"
    ],
    2: [
      "03:24 PM - 04:24 PM", "04:24 PM - 05:24 PM", "05:24 PM - 06:24 PM",
      "06:24 PM - 07:24 PM", "07:24 PM - 08:24 PM", "08:24 PM - 09:24 PM",
      "09:24 PM - 10:24 PM", "10:24 PM - 11:36 PM"
    ],
    3: [
      "11:36 PM - 12:36 AM", "12:36 AM - 01:36 AM", "01:36 AM - 02:36 AM",
      "02:36 AM - 03:36 AM", "03:36 AM - 04:36 AM", "04:36 AM - 05:36 AM",
      "05:36 AM - 06:36 AM", "06:36 AM - 06:54 AM"
    ],
  };
  return slots[shiftId] || [];
}
