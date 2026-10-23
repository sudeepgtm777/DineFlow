// @ts-nocheck
// hooks/custumer/useCart.js
import { useSelector, useDispatch } from "react-redux";
import {
  setOrderItems,
  updateItemQuantity,
  removeItem,
} from "@/lib/redux/cartSlice";

const useCart = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state: any) => state.cart);

  const addToCart = (item) => {
    dispatch(
      setOrderItems({
        items: [...cartState.items, item],
        subtotal: cartState.subtotal + item.price * item.quantity,
        totalItems: cartState.totalItems + item.quantity,
        isCartOpen: true,
      })
    );
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      dispatch(removeItem({ cartItemId }));
    } else {
      dispatch(updateItemQuantity({ cartItemId, quantity }));
    }
  };

  const removeFromCart = (cartItemId) => {
    dispatch(removeItem({ cartItemId }));
  };

  const clearCart = () => {
    dispatch(
      setOrderItems({
        items: [],
        subtotal: 0,
        totalItems: 0,
        isCartOpen: false,
      })
    );
  };

  return {
    cart: cartState.items,
    isCartOpen: cartState.isCartOpen,
    setIsCartOpen: (value) =>
      dispatch(setOrderItems({ ...cartState, isCartOpen: value })),
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems: cartState.totalItems,
    subtotal: cartState.subtotal,
    clearCart,
  };
};

export default useCart;