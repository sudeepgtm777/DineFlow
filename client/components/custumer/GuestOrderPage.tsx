// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "@/lib/router";
import {
  FiArrowLeft,
  FiCreditCard,
  FiCheck,
  FiTruck,
  FiHome,
  FiAlertTriangle,
  FiLoader,
} from "react-icons/fi";
import {
  updateOrderType,
  updateDeliveryAddress,
  updateSpecialInstructions,
  updateTableNumber,
  updatePaymentMethod,
  setOrderItems,
} from "@/lib/redux/orderSlice";
import useSubmitOrder from "@/hooks/custumer/useSubmitOrder";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { endpoints } from "@/lib/api/endpoints";
import Logo from "@/components/brand/Logo";

const GuestOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    items,
    subtotal,
    orderType,
    tableNumber,
    deliveryAddress,
    specialInstructions,
    paymentMethod,
  } = useSelector((state: any) => state.order);
  const { items: cartItems, subtotal: cartSubtotal } = useSelector((state: any) => state.cart);

  const { isSubmitting, orderSuccess, error, handleSubmitOrder } = useSubmitOrder();

  const [activeOrder, setActiveOrder] = useState(null);
  const [activeOrderItems, setActiveOrderItems] = useState([]);
  const [activeOrderSubtotal, setActiveOrderSubtotal] = useState(0);

  // Sync cart to order and fetch active order
  useEffect(() => {
    const table = searchParams.get("table");
    const orderId = searchParams.get("orderId");

    if (table) {
      dispatch(updateOrderType("dine-in"));
      dispatch(updateTableNumber(table));
    }

    // Sync cart items to order state
    if (cartItems.length > 0 && !orderId) {
      dispatch(
        setOrderItems({
          items: cartItems.map((item) => ({
            id: item.cartItemId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            specialInstructions: item.specialInstructions || "",
          })),
          subtotal: cartSubtotal,
        })
      );
    }

    // Fetch active order for the table
    const fetchActiveOrder = async () => {
      if (!table || orderId) return;
      try {
        const response = await fetch(`${endpoints.order}/orders/active?tableNumber=${table}`);
        const data = await response.json();
        if (response.ok && data.order) {
          setActiveOrder(data.order);
          const enrichedItems = (data.order.items || []).map((item, index) => ({
            ...item,
            id: item.id || `active-${item.name}-${index}-${item.quantity}`,
          }));
          setActiveOrderItems(enrichedItems);
          setActiveOrderSubtotal(
            enrichedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
          );
          if (cartItems.length === 0) {
            dispatch(
              setOrderItems({
                items: enrichedItems.map((item) => ({
                  id: item.id,
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                  specialInstructions: item.specialInstructions || "",
                })),
                subtotal: enrichedItems.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                ),
              })
            );
          }
        }
      } catch (err) {
        console.error("Error fetching active order:", err);
      }
    };

    fetchActiveOrder();
  }, [searchParams, dispatch, cartItems, cartSubtotal]);

  // Combine items for display
  const displayItems = activeOrder && cartItems.length === 0 ? activeOrderItems : items;
  const displaySubtotal =
    activeOrder && cartItems.length === 0 ? activeOrderSubtotal : subtotal;

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Created Successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for your order. We'll prepare it right away.</p>
          <button
            onClick={() => navigate(`/order/?table=${tableNumber}`)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Back to Menu
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(`/?table=${tableNumber}`)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 mr-4 hover:text-indigo-600 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <Logo />
          <h1 className="ml-3 text-xl font-bold text-gray-800">Create Order</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Section */}
          <div className="md:w-2/3">
            {/* Order Type */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Type</h2>
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => dispatch(updateOrderType("dine-in"))}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
                    orderType === "dine-in"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  disabled={activeOrder}
                >
                  <div className="flex items-center justify-center">
                    <FiHome className="mr-2" />
                    <span>Dine In</span>
                  </div>
                </button>
                <button
                  onClick={() => dispatch(updateOrderType("delivery"))}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
                    orderType === "delivery"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  disabled={activeOrder}
                >
                  <div className="flex items-center justify-center">
                    <FiTruck className="mr-2" />
                    <span>Delivery</span>
                  </div>
                </button>
              </div>

              {/* Dine-in / Delivery Inputs */}
              {orderType === "dine-in" ? (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => dispatch(updateTableNumber(e.target.value))}
                    placeholder="Enter your table number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={activeOrder}
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => dispatch(updateDeliveryAddress(e.target.value))}
                    placeholder="Enter your delivery address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              )}

              {/* Special Instructions */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => dispatch(updateSpecialInstructions(e.target.value))}
                  placeholder="Any special requests or instructions"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Method</h2>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "counter"}
                    onChange={() => dispatch(updatePaymentMethod("counter"))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center">
                    <FiCreditCard className="text-gray-500 mr-2" />
                    <span className="text-gray-700">Pay at Counter</span>
                  </div>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => dispatch(updatePaymentMethod("card"))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center">
                    <FiCreditCard className="text-gray-500 mr-2" />
                    <span className="text-gray-700">Credit/Debit Card</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {displayItems.length > 0 ? (
                  displayItems.map((item, index) => (
                    <div
                      key={item.id || `item-${index}`}
                      className="flex justify-between items-start"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.name} × {item.quantity}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-xs text-gray-500 mt-1">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${displaySubtotal.toFixed(2)}</span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">$2.50</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Total</span>
                  <span className="text-indigo-600">
                    $
                    {(orderType === "delivery"
                      ? displaySubtotal + 2.5
                      : displaySubtotal
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleSubmitOrder(activeOrder?._id)}
                disabled={isSubmitting || displayItems.length === 0}
                className={`mt-6 w-full py-3 px-4 text-white rounded-lg font-semibold flex items-center justify-center transition-colors ${
                  isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : displayItems.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Creating Order...
                  </>
                ) : (
                  "Create Order"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
};

export default GuestOrder;