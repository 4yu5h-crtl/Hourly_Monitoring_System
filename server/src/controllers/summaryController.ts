import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection.js';
import { recalculateShiftMetrics } from './entriesController.js';

export const updateSummary = async (req: Request, res: Response) => {
  try {
    const { shift_log_id } = req.params;
    const summaryData = req.body;

    if (!shift_log_id) {
      return res.status(400).json({ error: 'shift_log_id is required' });
    }

    // Check if summary exists
    const existing = await query('SELECT * FROM production_summary WHERE shift_log_id = ?', [shift_log_id]) as any[];

    if (existing.length) {
      // Update
      const updates: string[] = [];
      const values: any[] = [];

      const fields = [
        'total_production', 'scrap', 'scrap_qty', 'rework', 'efficiency',
        'quality_status', 'std_ct', 'std_prod_hr', 'actual_ct', 'actual_prod_hr',
        'machine_name', 'b_n_machine', 'shift_engineer_approval', 'manager_approval',
        'present_operators', 'absent_operators', 'total_loss_qty', 'total_loss_hrs'
      ];

      for (const field of fields) {
        if (field in summaryData) {
          updates.push(`${field} = ?`);
          values.push(summaryData[field]);
        }
      }

      if (updates.length > 0) {
        values.push(shift_log_id);
        await query(
          `UPDATE production_summary SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE shift_log_id = ?`,
          values
        );
      }
    } else {
      // Create
      const id = uuidv4();
      const fields = [
        'total_production', 'scrap', 'scrap_qty', 'rework', 'efficiency',
        'quality_status', 'std_ct', 'std_prod_hr', 'actual_ct', 'actual_prod_hr',
        'machine_name', 'b_n_machine', 'shift_engineer_approval', 'manager_approval',
        'present_operators', 'absent_operators', 'total_loss_qty', 'total_loss_hrs'
      ];

      const insertFields = ['id', 'shift_log_id', ...fields];
      const insertValues = [id, shift_log_id, ...fields.map(f => summaryData[f] ?? null)];

      await query(
        `INSERT INTO production_summary (${insertFields.join(', ')}) VALUES (${insertFields.map(() => '?').join(', ')})`,
        insertValues
      );
    }

    if (summaryData.std_prod_hr !== undefined) {
      await recalculateShiftMetrics(shift_log_id);
    }

    res.json({ success: true, shift_log_id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSummary = async (req: Request, res: Response) => {
  try {
    const { shift_log_id } = req.params;

    if (!shift_log_id) {
      return res.status(400).json({ error: 'shift_log_id is required' });
    }

    const summaries = await query('SELECT * FROM production_summary WHERE shift_log_id = ?', [shift_log_id]) as any[];
    res.json(summaries[0] || {});
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
