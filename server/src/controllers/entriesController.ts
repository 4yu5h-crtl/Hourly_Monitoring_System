import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection.js';

export const updateEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cum_qty, hrly_qty, std_variance, reasons_text, edited } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Entry ID is required' });
    }

    // Check if entry exists
    const entries = await query('SELECT * FROM hourly_entries WHERE id = ?', [id]) as any[];
    if (!entries.length) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Update entry - store input and calculated fields
    await query(
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

    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLossDetails = async (req: Request, res: Response) => {
  try {
    const { entry_id } = req.params;
    const lossData = req.body;

    if (!entry_id) {
      return res.status(400).json({ error: 'Entry ID is required' });
    }

    // Check if loss details exist
    const existing = await query('SELECT * FROM loss_details WHERE hourly_entry_id = ?', [entry_id]) as any[];

    if (existing.length) {
      // Update
      const updates: string[] = [];
      const values: any[] = [];

      const fields = [
        'ct_loss', 'ct_loss_reason', 'start_loss', 'start_loss_reason', 'mech_maintenance', 'mech_maintenance_reason',
        'elect_maintenance', 'elect_maintenance_reason', 'reset', 'reset_reason', 'machine_adjustment', 'machine_adjustment_reason',
        'supplier', 'supplier_reason', 'shared_operation', 'shared_operation_reason', 'tool', 'tool_reason',
        'spindle_service', 'spindle_service_reason', 'wheel_change', 'wheel_change_reason', 'operator', 'operator_reason',
        'plan_stop', 'plan_stop_reason', 'quality', 'quality_reason', 'system_loss', 'system_reason'
      ];

      for (const field of fields) {
        if (field in lossData) {
          updates.push(`${field} = ?`);
          values.push(lossData[field]);
        }
      }

      if (updates.length > 0) {
        values.push(entry_id);
        await query(
          `UPDATE loss_details SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE hourly_entry_id = ?`,
          values
        );
      }
    } else {
      // Create
      const id = uuidv4();
      const fields = [
        'ct_loss', 'ct_loss_reason', 'start_loss', 'start_loss_reason', 'mech_maintenance', 'mech_maintenance_reason',
        'elect_maintenance', 'elect_maintenance_reason', 'reset', 'reset_reason', 'machine_adjustment', 'machine_adjustment_reason',
        'supplier', 'supplier_reason', 'shared_operation', 'shared_operation_reason', 'tool', 'tool_reason',
        'spindle_service', 'spindle_service_reason', 'wheel_change', 'wheel_change_reason', 'operator', 'operator_reason',
        'plan_stop', 'plan_stop_reason', 'quality', 'quality_reason', 'system_loss', 'system_reason'
      ];

      const insertFields = ['id', 'hourly_entry_id', ...fields];
      const insertValues = [id, entry_id, ...fields.map(f => lossData[f] || null)];

      await query(
        `INSERT INTO loss_details (${insertFields.join(', ')}) VALUES (${insertFields.map(() => '?').join(', ')})`,
        insertValues
      );
    }

    res.json({ success: true, entry_id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
