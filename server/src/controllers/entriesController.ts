import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool, { query } from '../db/connection.js';

export const updateEntry = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { cum_qty, hrly_qty, std_variance, reasons_text, edited, lossDetails } = req.body; 

    if (!id) {
      connection.release();
      return res.status(400).json({ error: 'Entry ID is required' });
    }

    await connection.beginTransaction();

    // Check if entry exists
    const [entries] = await connection.execute('SELECT * FROM hourly_entries WHERE id = ?', [id]) as any[];
    if (!entries.length) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Update entry - store input and calculated fields
    await connection.execute(
      `UPDATE hourly_entries
       SET cum_qty = ?, hrly_qty = ?, std_variance = ?, reasons_text = ?, edited = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        cum_qty !== undefined ? cum_qty : null,
        hrly_qty !== undefined ? hrly_qty : null,
        std_variance !== undefined ? std_variance : null,
        reasons_text || "",
        edited || false,
        id
      ]
    );

    // If loss details are provided in the payload, update them atomically too
    if (lossDetails) {
      const [existing] = await connection.execute('SELECT * FROM loss_details WHERE hourly_entry_id = ?', [id]) as any[];

      if (existing.length) {
        // Update
        const updates: string[] = [];
        const values: any[] = [];

        const fields = [
          'loss_machine',
          'ct_loss', 'ct_loss_reason', 'start_loss', 'start_loss_reason', 'mech_maintenance', 'mech_maintenance_reason',
          'elect_maintenance', 'elect_maintenance_reason', 'reset', 'reset_reason', 'machine_adjustment', 'machine_adjustment_reason',
          'supplier', 'supplier_reason', 'shared_operation', 'shared_operation_reason', 'tool', 'tool_reason',
          'spindle_service', 'spindle_service_reason', 'wheel_change', 'wheel_change_reason', 'operator', 'operator_reason',
          'plan_stop', 'plan_stop_reason', 'quality', 'quality_reason'
        ];

        for (const field of fields) {
          if (field in lossDetails) {
            updates.push(`${field} = ?`);
            values.push(lossDetails[field]);
          }
        }

        if ('system' in lossDetails) {
          updates.push(`system_loss = ?`);
          values.push(lossDetails.system);
        }
        if ('system_reason' in lossDetails) {
          updates.push(`system_reason = ?`);
          values.push(lossDetails.system_reason);
        }

        // Add support if it already matches database name 'system_loss' properly just in case
        if ('system_loss' in lossDetails && !('system' in lossDetails)) {
          updates.push(`system_loss = ?`);
          values.push(lossDetails.system_loss);
        }

        if (updates.length > 0) {
          values.push(id);
          await connection.execute(
            `UPDATE loss_details SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE hourly_entry_id = ?`,
            values
          );
        }
      } else {
        // Create
        const lossId = uuidv4();
        const fields = [
          'loss_machine',
          'ct_loss', 'ct_loss_reason', 'start_loss', 'start_loss_reason', 'mech_maintenance', 'mech_maintenance_reason',
          'elect_maintenance', 'elect_maintenance_reason', 'reset', 'reset_reason', 'machine_adjustment', 'machine_adjustment_reason',
          'supplier', 'supplier_reason', 'shared_operation', 'shared_operation_reason', 'tool', 'tool_reason',
          'spindle_service', 'spindle_service_reason', 'wheel_change', 'wheel_change_reason', 'operator', 'operator_reason',
          'plan_stop', 'plan_stop_reason', 'quality', 'quality_reason'
        ];

        const insertFields = ['id', 'hourly_entry_id', ...fields, 'system_loss', 'system_reason'];
        const insertValues = [
          lossId,
          id,
          ...fields.map(f => lossDetails[f] ?? null),
          lossDetails.system ?? lossDetails.system_loss ?? null,
          lossDetails.system_reason ?? null
        ];

        await connection.execute(
          `INSERT INTO loss_details (${insertFields.join(', ')}) VALUES (${insertFields.map(() => '?').join(', ')})`,
          insertValues
        );
      }
    }

    await connection.commit();
    res.json({ success: true, id });
  } catch (error: any) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

export const getEntries = async (req: Request, res: Response) => {
  try {
    const { shift_log_id } = req.query;

    if (!shift_log_id) {
      return res.status(400).json({ error: 'shift_log_id is required' });
    }

    const entries = await query('SELECT * FROM hourly_entries WHERE shift_log_id = ? ORDER BY created_at', [shift_log_id]);
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
