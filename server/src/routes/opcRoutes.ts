import express from 'express';
import { fetchAndStoreCumQty, getCumQty } from '../controllers/opcController.js';

const router = express.Router();

router.get('/cum-qty', getCumQty);
router.post('/cum-qty/store', fetchAndStoreCumQty);

export default router;
