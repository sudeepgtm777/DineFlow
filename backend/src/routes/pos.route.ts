// @ts-nocheck
import express from 'express';
import {
  createBill,
  getAllBills,
  getDailySales,
  getMonthlySales,
  getSalesByTimeRange,
  getTopItems,
  getTotalByPaymentType,
  transferCreditTo,
  addItemsToOrder,
} from '../controllers/pos.controller';
import isAuthenticated from '../middlewares/isAuthenticated';

const router = express.Router();

router.post('/create-bill', isAuthenticated, createBill);
router.get('/daily-sales', isAuthenticated, getDailySales);
router.get('/monthly-sales', isAuthenticated, getMonthlySales);
router.get('/top-items', isAuthenticated, getTopItems);
router.get('/total-by-payment-type', isAuthenticated, getTotalByPaymentType);
router.post('/transfer-credit', isAuthenticated, transferCreditTo);
router.get('/all-bills', isAuthenticated, getAllBills);
router.get('/sales', isAuthenticated, getSalesByTimeRange);
router.put('/add-items/:tableNumber', addItemsToOrder);

export default router;
