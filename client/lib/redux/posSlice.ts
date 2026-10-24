import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type POSState = {
  cart: Array<{ id?: string; name?: string; price: number; quantity: number }>;
  subtotal: number;
  discount: number;
  discountPercent: number;
  cash: number;
  credit: number;
  online: number;
  total: number;
  customerName: string;
  customerNumber: string;
};

const initialState: POSState = {
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
    setPOSData(state, action: PayloadAction<Partial<POSState>>) {
      return { ...state, ...action.payload };
    },
    clearPOSData() {
      return initialState;
    },
  },
});

export const { setPOSData, clearPOSData } = posSlice.actions;
export default posSlice.reducer;
