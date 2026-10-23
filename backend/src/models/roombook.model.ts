// @ts-nocheck
// models/roomBooking.model.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  checkInDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  checkOutDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["booked", "checked-in", "checked-out", "cancelled"],
    default: "booked",
  },
}, { timestamps: true });

export default mongoose.model("RoomBooking", bookingSchema);
