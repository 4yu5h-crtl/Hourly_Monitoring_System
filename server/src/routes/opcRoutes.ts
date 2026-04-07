import express from 'express';
import { getCumQty } from '../controllers/opcController.js';

const router = express.Router();

router.get('/cum-qty', getCumQty);

export default router;
