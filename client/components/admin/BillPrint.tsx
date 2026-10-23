// @ts-nocheck
import React from 'react';
import Logo from '@/components/brand/Logo';

const BillPrint = React.forwardRef(({ cart, subtotal, serviceCharge, total, orderNumber }, ref) => {
  const currentDate = new Date().toLocaleString();

  return (
    <div ref={ref} className="p-2 w-64 font-mono text-xs">
      <div className="text-center mb-2">
        <div className="flex justify-center mb-1">
          <Logo href={null} size="sm" wordmarkClassName="font-bold text-sm text-black" />
        </div>
        <p>123 Main Street, City</p>
        <p>Phone: 01-2345678</p>
      </div>
      
      <div className="border-t border-b border-black py-1 my-1 text-center">
        <p>Order #: {orderNumber}</p>
        <p>Date: {currentDate}</p>
      </div>
      
      <table className="w-full mb-2">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left">Item</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id}>
              <td className="text-left">{item.name}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">Rs. {(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="border-t border-black pt-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Service Charge (10%):</span>
          <span>Rs. {serviceCharge.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>TOTAL:</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="text-center mt-4 pt-2 border-t border-black">
        <p>Thank you for dining with us!</p>
        <p>** This is a computer generated bill **</p>
      </div>
    </div>
  );
});

BillPrint.displayName = 'BillPrint';

export default BillPrint;