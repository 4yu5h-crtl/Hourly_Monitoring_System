import { Router } from 'express';
import { updateSummary, getSummary } from '../controllers/summaryController.js';

const router = Router();

// GET /api/summary/:shift_log_id
router.get('/:shift_log_id', getSummary);

// PUT /api/summary/:shift_log_id (update summary)
router.put('/:shift_log_id', updateSummary);

export default router;
