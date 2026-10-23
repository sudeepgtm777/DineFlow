// @ts-nocheck
// redux/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    subtotal: 0,
    totalItems: 0,
    isCartOpen: false,
  },
  reducers: {
    setOrderItems: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateItemQuantity: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);
      if (item) {
        state.subtotal -= item.price * item.quantity;
        state.totalItems -= item.quantity;
        item.quantity = quantity;
        state.subtotal += item.price * quantity;
        state.totalItems += quantity;
      }
    },
    removeItem: (state, action) => {
      const { cartItemId } = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);
      if (item) {
        state.subtotal -= item.price * item.quantity;
        state.totalItems -= item.quantity;
        state.items = state.items.filter((item) => item.cartItemId !== cartItemId);
      }
    },
  },
});

export const { setOrderItems, updateItemQuantity, removeItem } = cartSlice.actions;
export default cartSlice.reducer;