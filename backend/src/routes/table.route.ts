// @ts-nocheck
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

const router = express.Router();

router.post('/createtable', isAuthenticated, createTable);
router.get('/gettables', isAuthenticated, getAllTables);
router.get('/totaldocuments', getTableBookingStatusCounts); // Specific route before dynamic
router.get('/:tableNumber', getTableByNumber); // Dynamic route after
router.put('/release/:tableNumber', isAuthenticated, releaseTable);
router.put('/toggle-booking/:tableId', isAuthenticated, toggleTableBooking);
router.get('/get-qrcodes', getAllTableQRCodes);
router.delete('/delete/:tableId', isAuthenticated, deleteTable);

export default router;
