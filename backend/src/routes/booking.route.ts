import express from 'express';
import {
  bookRoomAsCustomer,
  getAllBookings,
  updateBookingStatus,
} from '../controllers/booking.controller';
import isAuthenticated from '../middlewares/isAuthenticated';
import isAdmin from '../middlewares/isAdmin';

const router = express.Router();

router.post('/:roomNumber', bookRoomAsCustomer);
router.get('/getbookings', isAuthenticated, isAdmin, getAllBookings);
router.patch('/:bookingId', isAuthenticated, isAdmin, updateBookingStatus);

export default router;
