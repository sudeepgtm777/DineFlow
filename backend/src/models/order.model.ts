// @ts-nocheck
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      default: 'Guest',
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: true,
          min: [0.01, 'Price must be greater than 0'],
        },
        specialInstructions: { type: String },
      },
    ],
    orderType: {
      type: String,
      required: true,
      enum: ['delivery', 'dine-in'],
      default: 'dine-in',
    },

    tableNumber: {
      type: String,
      required: function () {
        return this.orderType === 'dine-in';
      },
    },
    phoneNumber: {
      type: String,
      required: function () {
        return this.orderType === 'delivery';
      },
    },
    deliveryAddress: {
      type: String,
      required: function () {
        return this.orderType === 'delivery';
      },
    },
    specialInstructions: { type: String },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['counter', 'card'],
      default: 'counter',
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled', 'delivered'],
      default: 'pending',
    },
    sentToKOT: {
      type: Boolean,
      default: false,
    },
    bookingSessionId: {
      type: String,
      required: function () {
        return this.orderType === 'dine-in';
      },
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Add total virtual property
orderSchema.virtual('total').get(function () {
  return this.orderType === 'delivery' ? this.subtotal + 2.5 : this.subtotal;
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
