import express from 'express';
import { getBillDetails } from '../controllers/bill.controller';
import isAuthenticated from '../middlewares/isAuthenticated';
import isAdmin from '../middlewares/isAdmin';

const router = express.Router();

router.get('/table/:tableNumber', isAuthenticated, isAdmin, getBillDetails);

export default router;
