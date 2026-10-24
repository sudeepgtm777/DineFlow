import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "./cartSlice";

export type OrderState = {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  orderType: string;
  tableNumber: string;
  deliveryAddress: string;
  phoneNumber: string;
  specialInstructions: string;
  paymentMethod: string;
};

const initialState: OrderState = {
  items: [],
  subtotal: 0,
  totalItems: 0,
  orderType: "dine-in",
  tableNumber: "",
  deliveryAddress: "",
  phoneNumber: "",
  specialInstructions: "",
  paymentMethod: "counter",
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrderItems: (
      state,
      action: PayloadAction<{ items: CartItem[]; subtotal: number; totalItems?: number }>
    ) => {
      state.items = action.payload.items;
      state.subtotal = action.payload.subtotal;
      state.totalItems =
        action.payload.totalItems ??
        action.payload.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    },
    updateOrderType: (state, action: PayloadAction<string>) => {
      state.orderType = action.payload;
    },
    updateTableNumber: (state, action: PayloadAction<string>) => {
      state.tableNumber = action.payload;
    },
    updateDeliveryAddress: (state, action: PayloadAction<string>) => {
      state.deliveryAddress = action.payload;
    },
    updatePhoneNumber: (state, action: PayloadAction<string>) => {
      state.phoneNumber = action.payload;
    },
    updateSpecialInstructions: (state, action: PayloadAction<string>) => {
      state.specialInstructions = action.payload;
    },
    updatePaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },
    clearOrder: () => initialState,
  },
});

export const {
  setOrderItems,
  updateOrderType,
  updateTableNumber,
  updateDeliveryAddress,
  updatePhoneNumber,
  updateSpecialInstructions,
  updatePaymentMethod,
  clearOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
