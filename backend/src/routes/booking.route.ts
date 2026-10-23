// @ts-nocheck
import express from "express";
import { bookRoomAsCustomer, getAllBookings, updateBookingStatus } from "../controllers/booking.controller";
import isAuthenticated from "../middlewares/isAuthenticated";
const router = express.Router();

// Create room with multiple image uploads
router.post("/:roomNumber", bookRoomAsCustomer)
// Get all bookings
router.get("/getbookings",isAuthenticated, getAllBookings);
// Update booking status
router.patch("/:bookingId", isAuthenticated, updateBookingStatus);

export default router;
