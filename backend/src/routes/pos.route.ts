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
import isAdmin from '../middlewares/isAdmin';

const router = express.Router();

router.post('/create-bill', isAuthenticated, isAdmin, createBill);
router.get('/daily-sales', isAuthenticated, isAdmin, getDailySales);
router.get('/monthly-sales', isAuthenticated, isAdmin, getMonthlySales);
router.get('/top-items', isAuthenticated, isAdmin, getTopItems);
router.get(
  '/total-by-payment-type',
  isAuthenticated,
  isAdmin,
  getTotalByPaymentType,
);
router.post('/transfer-credit', isAuthenticated, isAdmin, transferCreditTo);
router.get('/all-bills', isAuthenticated, isAdmin, getAllBills);
router.get('/sales', isAuthenticated, isAdmin, getSalesByTimeRange);
router.put(
  '/add-items/:tableNumber',
  isAuthenticated,
  isAdmin,
  addItemsToOrder,
);

export default router;
