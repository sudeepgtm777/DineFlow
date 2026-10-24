// hooks/customer/useCart.js
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setOrderItems,
  updateItemQuantity,
  removeItem,
  clearCart as clearCartAction,
} from "@/lib/redux/cartSlice";

const useCart = () => {
  const dispatch = useAppDispatch();
  const cartState = useAppSelector((state) => state.cart);

  const addToCart = (item) => {
    const cartItem = {
      ...item,
      cartItemId:
        item.cartItemId ||
        `${item._id || item.id || item.name}-${Date.now()}`,
    };
    dispatch(
      setOrderItems({
        items: [...cartState.items, cartItem],
        subtotal: cartState.subtotal + cartItem.price * cartItem.quantity,
        totalItems: cartState.totalItems + cartItem.quantity,
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
    dispatch(clearCartAction());
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