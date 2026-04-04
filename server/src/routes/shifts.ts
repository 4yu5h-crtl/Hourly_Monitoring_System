import { Router } from 'express';
import { getShifts, getShiftById, createOrGetShift } from '../controllers/shiftsController.js';

const router = Router();

// GET /api/shifts?date=...&shift=...&machine=...&channel=...
router.get('/', getShifts);

// POST /api/shifts (create or get)
router.post('/', createOrGetShift);

// GET /api/shifts/:id
router.get('/:id', getShiftById);

export default router;
