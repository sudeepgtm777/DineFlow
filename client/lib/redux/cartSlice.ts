import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  cartItemId?: string;
  _id?: string;
  id?: string;
  menuItemId?: string;
  name?: string;
  price: number;
  quantity: number;
  image?: string | { url?: string };
  category?: string;
  specialInstructions?: string;
};

export type CartState = {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  isCartOpen: boolean;
};

const initialState: CartState = {
  items: [],
  subtotal: 0,
  totalItems: 0,
  isCartOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setOrderItems: (state, action: PayloadAction<Partial<CartState>>) => {
      return { ...state, ...action.payload };
    },
    updateItemQuantity: (
      state,
      action: PayloadAction<{ cartItemId: string; quantity: number }>
    ) => {
      const { cartItemId, quantity } = action.payload;
      const item = state.items.find((entry) => entry.cartItemId === cartItemId);
      if (item) {
        state.subtotal -= item.price * item.quantity;
        state.totalItems -= item.quantity;
        item.quantity = quantity;
        state.subtotal += item.price * quantity;
        state.totalItems += quantity;
      }
    },
    removeItem: (state, action: PayloadAction<{ cartItemId: string }>) => {
      const { cartItemId } = action.payload;
      const item = state.items.find((entry) => entry.cartItemId === cartItemId);
      if (item) {
        state.subtotal -= item.price * item.quantity;
        state.totalItems -= item.quantity;
        state.items = state.items.filter((entry) => entry.cartItemId !== cartItemId);
      }
    },
    clearCart: () => initialState,
  },
});

export const { setOrderItems, updateItemQuantity, removeItem, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
