import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from '@/lib/router';
import { FiArrowLeft, FiPrinter, FiAlertTriangle } from 'react-icons/fi';
import { endpoints } from "@/lib/api/endpoints";
import BillReceipt from '@/components/admin/BillReceipt';
import api from '@/lib/axios';
import { toast } from 'react-toastify';

const OrderDetails = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const printRef = useRef<any>();

  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tableNumber) {
      setError('Missing table number');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await api.get(
          `${endpoints.order}/table-bill/${tableNumber}`,
        );
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [tableNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleSettle = async () => {
    try {
      if (!tableNumber) {
        throw new Error('Table number is missing');
      }
      const confirmed = window.confirm(
        'Settle this table bill and mark unbilled tickets as paid?',
      );
      if (!confirmed) return;

      const { data: result } = await api.put(
        `${endpoints.order}/orders/complete`,
        { tableNumber },
      );

      if (result.matchedCount === 0) {
        throw new Error('No unbilled orders found for this table session');
      }

      toast.success('Bill settled');
      const { data } = await api.get(
        `${endpoints.order}/table-bill/${tableNumber}`,
      );
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error completing orders:', error);
      toast.error(
        error.response?.data?.message ||
          `Failed to complete orders: ${error.message}`,
      );
    }
  };

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
        <div className='flex gap-2'>
          <button
            onClick={handleSettle}
            disabled={orders.length === 0}
            className='flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Settle bill
          </button>
          <button
            onClick={handlePrint}
            disabled={orders.length === 0}
            className='flex items-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <FiPrinter className='mr-2' /> Print Bill
          </button>
        </div>
      </div>

      <div ref={printRef}>
        <BillReceipt
          orders={orders}
          tableNumber={tableNumber}
          emptyMessage='No open bill for this table. After release, a new session can start.'
        />
      </div>
    </div>
  );
};

export default OrderDetails;
