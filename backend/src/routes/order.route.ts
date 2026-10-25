import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  addItemToOrder,
  createOrder,
  getAllOrders,
  getFilteredOrders,
  updateOrderStatus,
  getActiveOrder,
  completeOrder,
  sendToKotController,
  getTableBill,
} from '../controllers/order.controller';
import isAuthenticated from '../middlewares/isAuthenticated';
import isAdmin from '../middlewares/isAdmin';
import isStaff from '../middlewares/isStaff';

const guestLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Try again in a minute.', success: false },
});

const router = express.Router();

router.post('/create-order', guestLimiter, createOrder);
router.post('/add-item/:orderId', guestLimiter, addItemToOrder);
router.get('/orders/active', guestLimiter, getActiveOrder);

router.get('/orders', isAuthenticated, isStaff, getAllOrders);
router.get('/orders/filter', isAuthenticated, isStaff, getFilteredOrders);
router.get('/table-bill/:tableNumber', isAuthenticated, isAdmin, getTableBill);
router.put('/orders/complete', isAuthenticated, isAdmin, completeOrder);
router.put(
  '/orders/:orderId/send-to-kot',
  isAuthenticated,
  isStaff,
  sendToKotController,
);
router.put('/orders/:id', isAuthenticated, isStaff, updateOrderStatus);

export default router;
