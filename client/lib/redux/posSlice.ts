// @ts-nocheck
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  subtotal: 0,
  discount: 0,
  discountPercent: 0,
  cash: 0,
  credit: 0,
  online: 0,
  total: 0,
  customerName: "Guest",
  customerNumber: "",
};

const posSlice = createSlice({
  name: "pos",
  initialState,
  reducers: {
    setPOSData(state, action) {
      return { ...state, ...action.payload };
    },
    clearPOSData() {
      return initialState;
    },
  },
});

export const { setPOSData, clearPOSData } = posSlice.actions;
export default posSlice.reducer;
