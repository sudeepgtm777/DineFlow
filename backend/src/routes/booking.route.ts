import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  bookRoomAsCustomer,
  getAllBookings,
  updateBookingStatus,
} from '../controllers/booking.controller';
import isAuthenticated from '../middlewares/isAuthenticated';
import isAdmin from '../middlewares/isAdmin';

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many booking attempts. Try again in a minute.', success: false },
});

const router = express.Router();

router.post('/:roomNumber', bookingLimiter, bookRoomAsCustomer);
router.get('/getbookings', isAuthenticated, isAdmin, getAllBookings);
router.patch('/:bookingId', isAuthenticated, isAdmin, updateBookingStatus);

export default router;
