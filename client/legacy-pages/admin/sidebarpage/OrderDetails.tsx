// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from '@/lib/router';
import { FiArrowLeft, FiPrinter, FiAlertTriangle } from 'react-icons/fi';
import { endpoints } from "@/lib/api/endpoints";
import Logo from '@/components/brand/Logo';

const OrderDetails = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurantInfo] = useState({
    name: 'DineFlow Restaurant',
    address: 'Butwal, Nepal',
    phone: '08254080',
    taxId: 'TAX-123456789',
    footerMessage: 'Thank you for dining with us!',
  });

  useEffect(() => {
    if (!tableNumber) {
      setError('Missing table number');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        // Log the API endpoint for debugging
        console.log(
          `Fetching orders from: ${endpoints.order}/orders/active?tableNumber=${tableNumber}`,
        );
        const res = await fetch(
          `${endpoints.order}/orders/active?tableNumber=${tableNumber}`,
        );
        const data = await res.json();

        if (res.ok) {
          setOrders(data.orders || []);
        } else {
          setError(data.message || 'Failed to fetch order details');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [tableNumber]);

  const handlePrint = async () => {
    try {
      if (!tableNumber) {
        throw new Error('Table number is missing');
      }

      const response = await fetch(`${endpoints.order}/orders/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableNumber }),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to complete orders');
      }

      if (result.matchedCount === 0) {
        throw new Error('No active orders found to complete');
      }

      if (result.modifiedCount > 0) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => ({
            ...order,
            status: 'completed',
          })),
        );
      }

      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;

      const printStyle = `
        @media print {
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px dashed #000;
            padding-bottom: 15px;
          }
          .bill-item {
            page-break-inside: avoid;
          }
          .bill-totals {
            page-break-inside: avoid;
          }
          .bill-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.9em;
          }
        }
      `;

      document.body.innerHTML = `
        <style>${printStyle}</style>
        <div class="print-container">${printContents}</div>
      `;

      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    } catch (error) {
      console.error('Error completing orders:', error);
      alert(`Failed to complete orders: ${error.message}`);
    }
  };

  const getOrderSubtotal = (order) => {
    return (order.items || []).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  };

  const grandTotal = orders.reduce(
    (sum, order) => sum + getOrderSubtotal(order),
    0,
  );

  const currentDate = new Date().toLocaleString();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center text-center p-4'>
        <div className='max-w-md bg-white rounded-lg shadow p-6'>
          <FiAlertTriangle className='text-red-500 text-3xl mx-auto mb-2' />
          <h2 className='text-xl font-semibold mb-2'>Error</h2>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-6 bg-gray-50'>
      <div className='flex items-center justify-between mb-6 no-print'>
        <button
          onClick={() => navigate('/admin/orders')}
          className='flex items-center text-gray-700 hover:text-indigo-600'
        >
          <FiArrowLeft className='mr-2' /> Back
        </button>
        <button
          onClick={handlePrint}
          className='flex items-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700'
        >
          <FiPrinter className='mr-2' /> Print Bill
        </button>
      </div>

      <div ref={printRef} className='max-w-2xl mx-auto bg-white p-6 shadow-sm'>
        <div className='print-header'>
          <div className='flex justify-center mb-3'>
            <Logo href={null} size="lg" />
          </div>
          <h1 className='text-3xl font-bold mb-1'>{restaurantInfo.name}</h1>
          <p className='text-sm'>{restaurantInfo.address}</p>
          <p className='text-sm'>Tel: {restaurantInfo.phone}</p>
          <p className='text-sm mt-2 font-medium'>
            TAX ID: {restaurantInfo.taxId}
          </p>
        </div>

        <div className='mb-6 border-b pb-4'>
          <div className='flex justify-between'>
            <div>
              <p className='font-semibold'>
                Table: <span className='font-normal'>#{tableNumber}</span>
              </p>
              <p className='font-semibold'>
                Date: <span className='font-normal'>{currentDate}</span>
              </p>
            </div>
            <div className='text-right'>
              <p className='font-semibold'>
                Bill No:{' '}
                <span className='font-normal'>
                  #{orders[0]?._id.slice(-6) || 'N/A'}
                </span>
              </p>
              <p className='font-semibold'>
                Staff: <span className='font-normal'>Admin</span>
              </p>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className='text-center py-8'>No active orders for this table.</p>
        ) : (
          <>
            <div className='mb-6'>
              <div className='grid grid-cols-12 gap-2 font-bold border-b pb-2 mb-2'>
                <div className='col-span-6'>Item</div>
                <div className='col-span-2 text-center'>Qty</div>
                <div className='col-span-2 text-right'>Price</div>
                <div className='col-span-2 text-right'>Total</div>
              </div>

              {orders.map((order, orderIndex) => (
                <div key={order._id || orderIndex} className='bill-item mb-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='font-semibold'>
                      Order #{order._id?.slice(-6) || `CUST-${orderIndex + 1}`}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.status === 'Pending'
                          ? 'bg-yellow-100'
                          : order.status === 'In Progress'
                            ? 'bg-blue-100'
                            : order.status === 'Completed'
                              ? 'bg-green-100'
                              : 'bg-gray-100'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {(order.items || []).map((item, itemIndex) => (
                    <div
                      key={`${item.name}-${itemIndex}`}
                      className='grid grid-cols-12 gap-2 py-1 items-center'
                    >
                      <div className='col-span-6'>
                        {item.name}
                        {item.specialInstructions && (
                          <p className='text-xs text-gray-500'>
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <div className='col-span-2 text-center'>
                        {item.quantity}
                      </div>
                      <div className='col-span-2 text-right'>
                        Rs {item.price.toFixed(2)}
                      </div>
                      <div className='col-span-2 text-right'>
                        Rs {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  <div className='grid grid-cols-12 gap-2 border-t pt-2 mt-2'>
                    <div className='col-span-10 text-right font-semibold'>
                      Subtotal:
                    </div>
                    <div className='col-span-2 text-right font-semibold'>
                      Rs {getOrderSubtotal(order).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='bill-totals border-t-2 border-dashed pt-4'>
              <div className='flex justify-between font-bold text-lg'>
                <span>Grand Total:</span>
                <span>Rs {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className='bill-footer mt-8 pt-4 border-t text-sm'>
              <p className='mb-1'>{restaurantInfo.footerMessage}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
