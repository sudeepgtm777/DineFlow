import React, { useMemo } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setPOSData } from '@/lib/redux/posSlice';
import { useNavigate } from '@/lib/router';
import api from '@/lib/axios';
import { endpoints } from "@/lib/api/endpoints";
import { toast } from 'react-toastify';

const POSPanel = ({
  cart,
  onIncrease,
  onDecrease,
  onRemove,
  subtotal,
  discount,
  setDiscount,
  cashPaid,
  setCashPaid,
  onlineAmount,
  setOnlineAmount,
  customerName,
  setCustomerName,
  customerNumber,
  setCustomerNumber,
  selectedTable,
}: any) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const total = useMemo(() => subtotal - discount, [subtotal, discount]);
  const creditAmount = useMemo(
    () => Math.max(0, total - (cashPaid + onlineAmount)),
    [total, cashPaid, onlineAmount],
  );
  const change = useMemo(
    () => Math.max(0, cashPaid + onlineAmount - total),
    [total, cashPaid, onlineAmount],
  );

  const paymentMethod =
    cashPaid > 0 && onlineAmount > 0
      ? 'mixed'
      : cashPaid > 0
        ? 'cash'
        : onlineAmount > 0
          ? 'online'
          : 'credit';

  const handleCheckout = async () => {
    const payload = {
      cart: cart.map((item) => ({
        id: item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total,
      cash: cashPaid,
      online: onlineAmount,
      discount,
      paymentMethod,
      orderType: selectedTable ? 'dine-in' : 'delivery',
      customerName: customerName || 'Guest',
      customerNumber,
      ...(selectedTable && { tableNumber: selectedTable }),
      ...(creditAmount > 0 && { credit: creditAmount }),
    };

    try {
      await api.post(`${endpoints.pos}/create-bill`, payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      dispatch(
        setPOSData({
          cart,
          subtotal,
          discount,
          cash: cashPaid,
          credit: creditAmount,
          online: onlineAmount,
          total,
          customerName,
          customerNumber,
        }),
      );

      navigate('/admin/pos/checkout');
    } catch (err) {
      console.error(
        '\u274C Failed to create POS entry:',
        err?.response?.data || err.message,
      );
      toast.error('Something went wrong while processing the order.');
    }
  };

  return (
    <div className='w-3/4 max-w-xl mx-auto p-4 font-mono text-sm bg-white'>
      {cart.length === 0 ? (
        <div className='text-center text-gray-400'>Cart is empty</div>
      ) : (
        <div className='space-y-2'>
          <ul className='space-y-1'>
            {cart.map((item) => (
              <li key={item.id} className='flex justify-between items-center'>
                <div className='flex-1'>
                  <p>{item.name}</p>
                  <p className='text-xs'>
                    {item.quantity} × Rs. {item.price.toFixed(2)} = Rs.{' '}
                    {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className='flex items-center space-x-1'>
                  <button
                    onClick={() => onDecrease(item.id)}
                    className='px-1 bg-gray-200 rounded'
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => onIncrease(item.id)}
                    className='px-1 bg-gray-200 rounded'
                  >
                    +
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className='ml-1 text-red-500'
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className='space-y-2'>
            <div>
              <label className='text-xs'>Customer Name:</label>
              <input
                type='text'
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className='w-full p-1 border rounded'
                placeholder='Guest'
              />
            </div>
            <div>
              <label className='text-xs'>Phone Number:</label>
              <input
                type='tel'
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value)}
                className='w-full p-1 border rounded'
                placeholder='9800000000'
              />
            </div>
            <div>
              <label className='text-xs'>Discount (Rs):</label>
              <input
                type='number'
                min='0'
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className='w-full p-1 border rounded'
              />
            </div>
            <div>
              <label className='text-xs'>Cash (Rs):</label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={cashPaid}
                onChange={(e) => setCashPaid(Number(e.target.value))}
                className='w-full p-1 border rounded'
              />
            </div>
            <div>
              <label className='text-xs'>Online (Rs):</label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={onlineAmount}
                onChange={(e) => setOnlineAmount(Number(e.target.value))}
                className='w-full p-1 border rounded'
              />
            </div>
            <div>
              <label className='text-xs font-bold'>Auto Credit (Rs):</label>
              <input
                type='number'
                value={creditAmount.toFixed(2)}
                disabled
                className='w-full p-1 border rounded bg-gray-100 text-gray-600'
              />
            </div>

            {Number(change) > 0 && (
              <div className='flex justify-between text-blue-600 font-bold pt-1'>
                <span>Change:</span>
                <span>Rs. {change}</span>
              </div>
            )}

            <div className='flex justify-between font-bold pt-2'>
              <span>Total</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className='w-full text-center bg-green-600 text-white py-1 rounded hover:bg-green-700'
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPanel;
