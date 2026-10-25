import React, { useRef } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import Logo from '@/components/brand/Logo';

const CheckoutPage = () => {
  const printRef = useRef<any>();

  const {
    cart,
    subtotal,
    discount,
    discountPercent,
    cash,
    credit,
    online,
    total,
    customerName,
    customerNumber,
  } = useAppSelector((state) => state.pos);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className='flex flex-col items-center mt-4'>
      {/* Printable Content */}
      <div
        ref={printRef}
        className='p-2 text-sm font-mono w-3/4 max-w-xl bg-white text-black'
        style={{ lineHeight: '1.4' }}
      >
        <div className='text-center mb-2'>
          <div className='flex justify-center mb-1'>
            <Logo href={null} size="sm" wordmarkClassName="font-bold text-base text-black" />
          </div>
          <p className='text-xs'>Thank you for dining with us!</p>
          <hr className='my-1 border-black' />
        </div>

        {/* Customer Info */}
        <div className='text-xs mb-2'>
          <div className='flex justify-between'>
            <span>Name:</span>
            <span>{customerName || 'Guest'}</span>
          </div>
          {customerNumber && (
            <div className='flex justify-between'>
              <span>Phone:</span>
              <span>{customerNumber}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className='mb-2'>
          {cart.map((item) => (
            <div key={item.id} className='flex justify-between text-xs'>
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <hr className='border-black mb-1' />

        {/* Totals */}
        <div className='text-xs space-y-0.5'>
          <div className='flex justify-between'>
            <span>Subtotal</span>
            <span>Rs. {subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className='flex justify-between'>
              <span>Discount ({discountPercent}%)</span>
              <span>-Rs. {discount.toFixed(2)}</span>
            </div>
          )}
          <div className='flex justify-between'>
            <span>Cash</span>
            <span>Rs. {cash.toFixed(2)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Credit</span>
            <span>Rs. {credit.toFixed(2)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Online</span>
            <span>Rs. {online.toFixed(2)}</span>
          </div>
        </div>

        <hr className='border-black my-1' />

        <div className='flex justify-between font-bold text-sm'>
          <span>Total</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>

        <hr className='border-black my-2' />

        {/* Footer */}
        <div className='text-center text-xs'>
          <p>Visit Again! 😊</p>
          <p>Printed: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        className='mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800'
      >
        Print Bill
      </button>
    </div>
  );
};

export default CheckoutPage;
