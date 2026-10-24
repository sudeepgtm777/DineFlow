import mongoose from "mongoose";

const PosSchema = new mongoose.Schema({
  items: [
    {
      id: {
        type: String,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  cash: {
    type: Number,
    default: 0,
  },
  credit: {
    type: Number,
    default: 0,
  },
  online: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "online", "upi", "wallet", "mixed", "credit"],
    default: "cash",
  },
  orderType: {
    type: String,
    enum: ["dine-in", "delivery", "room-service"],
    default: "dine-in",
  },
  customerDetails: {
    name: {
      type: String,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
  },
}, {
  timestamps: true
});

export default mongoose.model("Pos", PosSchema);
