import express from 'express';
import {
  createTable,
  getAllTableQRCodes,
  getAllTables,
  getTableByNumber,
  getTableBookingStatusCounts,
  releaseTable,
  deleteTable,
  toggleTableBooking,
} from '../controllers/table.controller';
import isAuthenticated from '../middlewares/isAuthenticated';
import isAdmin from '../middlewares/isAdmin';

const router = express.Router();

router.post('/createtable', isAuthenticated, isAdmin, createTable);
router.get('/gettables', isAuthenticated, isAdmin, getAllTables);
router.get(
  '/totaldocuments',
  isAuthenticated,
  isAdmin,
  getTableBookingStatusCounts,
);
router.get('/get-qrcodes', isAuthenticated, isAdmin, getAllTableQRCodes);
router.get('/:tableNumber', getTableByNumber);
router.put('/release/:tableNumber', isAuthenticated, isAdmin, releaseTable);
router.put(
  '/toggle-booking/:tableId',
  isAuthenticated,
  isAdmin,
  toggleTableBooking,
);
router.delete('/delete/:tableId', isAuthenticated, isAdmin, deleteTable);

export default router;
