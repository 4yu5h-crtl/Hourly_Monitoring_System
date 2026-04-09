import { Router } from 'express';
import { updateEntry, getEntries } from '../controllers/entriesController.js';

const router = Router();

// GET /api/entries?shift_log_id=...
router.get('/', getEntries);

// PUT /api/entries/:id (update entry)
router.put('/:id', updateEntry);

export default router;
