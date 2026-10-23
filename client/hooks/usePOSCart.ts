// @ts-nocheck
import { useState, useMemo, useEffect } from 'react';

const usePOSCart = () => {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0); // now absolute value
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [cashPaid, setCashPaid] = useState(0);
  const [creditAmount, setCreditAmount] = useState(0);
  const [customerName, setCustomerName] = useState('Guest');
  const [customerNumber, setCustomerNumber] = useState('');
  const [total, setTotal] = useState(0); // fixed total set externally

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((i) => i.id !== id));
  };

  const increaseQty = (id) => {
    setCart((prevCart) =>
      prevCart.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((i) =>
          i.id === id
            ? { ...i, quantity: i.quantity > 1 ? i.quantity - 1 : 1 }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCashPaid(0);
    setCreditAmount(0);
    setOnlineAmount(0);
    setTotal(0);
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  // Update credit amount automatically when other values change
  useEffect(() => {
    const calculatedCredit = total - (cashPaid + discount + onlineAmount);
    setCreditAmount(calculatedCredit > 0 ? calculatedCredit : 0);
  }, [cashPaid, discount, onlineAmount, total]);

  const change = useMemo(
    () => (cashPaid + discount + onlineAmount > total
      ? (cashPaid + discount + onlineAmount - total).toFixed(2)
      : 0),
    [cashPaid, discount, onlineAmount, total]
  );

  return {
    cart,
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
    subtotal,
    discount,
    setDiscount, // absolute amount
    total,
    setTotal, // set from UI
    cashPaid,
    setCashPaid,
    creditAmount, // auto-calculated
    onlineAmount,
    setOnlineAmount,
    change,
    customerName,
    setCustomerName,
    customerNumber,
    setCustomerNumber,
  };
};

export default usePOSCart;
