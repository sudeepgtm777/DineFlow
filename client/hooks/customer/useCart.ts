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
    const menuId = item._id || item.menuItemId || item.id;
    const quantity = item.quantity || 1;
    const existing = cartState.items.find(
      (entry) =>
        (entry._id || entry.menuItemId || entry.id) === menuId &&
        (entry.specialInstructions || "") === (item.specialInstructions || ""),
    );

    if (existing?.cartItemId) {
      dispatch(
        updateItemQuantity({
          cartItemId: existing.cartItemId,
          quantity: existing.quantity + quantity,
        }),
      );
      return;
    }

    const cartItem = {
      ...item,
      _id: item._id || item.menuItemId,
      quantity,
      cartItemId:
        item.cartItemId || `${menuId || item.name}-${Date.now()}`,
    };
    dispatch(
      setOrderItems({
        items: [...cartState.items, cartItem],
        subtotal: cartState.subtotal + cartItem.price * cartItem.quantity,
        totalItems: cartState.totalItems + cartItem.quantity,
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