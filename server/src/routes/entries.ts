import { Router } from 'express';
import { updateEntry, updateLossDetails, getEntries } from '../controllers/entriesController.js';

const router = Router();

// GET /api/entries?shift_log_id=...
router.get('/', getEntries);

// PUT /api/entries/:id (update entry)
router.put('/:id', updateEntry);

// PUT /api/entries/:entry_id/loss (update loss details)
router.put('/:entry_id/loss', updateLossDetails);

export default router;
