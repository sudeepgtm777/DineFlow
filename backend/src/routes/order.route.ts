import express from 'express';
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

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/add-item/:orderId', addItemToOrder);
router.get('/orders/active', getActiveOrder);

router.get('/orders', isAuthenticated, isStaff, getAllOrders);
router.get('/orders/filter', isAuthenticated, isAdmin, getFilteredOrders);
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
