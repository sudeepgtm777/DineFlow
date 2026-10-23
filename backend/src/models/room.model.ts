// @ts-nocheck
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
  },
  roomType: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    default: 2,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
  amenities: {
    type: [String],
    default: [],
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  currentOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null,
  },
  qrUrl: {
    type: String,
  },
  qrImage: {
    public_id: String,
    url: String,
  },
  photos: [
    {
      public_id: String,
      url: String,
    },
  ],
  checkInDate: {
    type: Date,
  },
  checkOutDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Room", roomSchema);
