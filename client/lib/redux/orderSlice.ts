// @ts-nocheck
// orderSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
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
    setOrderItems: (state, action) => {
      state.items = action.payload.items;
      state.subtotal = action.payload.subtotal;
      state.totalItems = action.payload.totalItems;
    },
    updateOrderType: (state, action) => {
      state.orderType = action.payload;
    },
    updateTableNumber: (state, action) => {
      state.tableNumber = action.payload;
    },
    updateDeliveryAddress: (state, action) => {
      state.deliveryAddress = action.payload;
    },
    updatePhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },
    updateSpecialInstructions: (state, action) => {
      state.specialInstructions = action.payload;
    },
    updatePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    clearOrder: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.totalItems = 0;
      state.orderType = "dine-in";
      state.tableNumber = "";
      state.deliveryAddress = "";
      state.phoneNumber = "";
      state.specialInstructions = "";
      state.paymentMethod = "counter";
    },
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