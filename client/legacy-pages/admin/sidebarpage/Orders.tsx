import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/axios';
import { endpoints } from "@/lib/api/endpoints";
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('day');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [billData, setBillData] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const billRef = useRef(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `${endpoints.order}/orders/filter?page=${page}&limit=${limit}`,
      );
      const sortedOrders = Array.isArray(data.orders)
        ? [...data.orders].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
        : [];
      setOrders(sortedOrders);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
      setTotalPages(1);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await api.put(`${endpoints.order}/orders/${orderId}`, {
        status: newStatus,
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSendToKOT = async (orderId) => {
    try {
      await api.put(`${endpoints.order}/orders/${orderId}/send-to-kot`);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, sentToKOT: true, status: 'in-progress' }
            : order,
        ),
      );
      toast.success('Order sent to KOT successfully!');
    } catch (err) {
      console.error('Error sending to KOT', err);
      toast.error('Failed to send to KOT. Please try again.');
    }
  };

  const handleGenerateBill = async (order) => {
    try {
      if (order.orderType === 'dine-in' && order.tableNumber) {
        // For dine-in orders, get all orders from the same booking session
        const sessionOrders = orders.filter(
          (o) =>
            o.orderType === 'dine-in' &&
            o.tableNumber === order.tableNumber &&
            o.bookingSessionId === order.bookingSessionId,
        );

        const totalAmount = sessionOrders.reduce(
          (sum, o) => sum + (o.subtotal || 0),
          0,
        );

        setBillData({
          customer: order.customerName,
          table: order.tableNumber,
          orderType: order.orderType,
          orders: sessionOrders,
          total: totalAmount.toFixed(2),
          sessionId: order.bookingSessionId,
        });
      } else {
        // For takeaway/delivery orders, group by customer
        const customerOrders = orders.filter(
          (o) =>
            o.orderType === order.orderType &&
            o.customerName === order.customerName &&
            new Date(o.createdAt).toDateString() ===
              new Date(order.createdAt).toDateString(),
        );

        const totalAmount = customerOrders.reduce(
          (sum, o) => sum + (o.subtotal || 0),
          0,
        );

        setBillData({
          customer: order.customerName,
          table: null,
          orderType: order.orderType,
          orders: customerOrders,
          total: totalAmount.toFixed(2),
        });
      }
    } catch (error) {
      console.error('Error generating bill:', error);
      toast.error('Failed to generate bill');
    }
  };

  const handlePrint = () => {
    if (!billData) {
      toast.error('Please generate a bill first');
      return;
    }
    window.print();
  };

  const filterByDate = (createdAt) => {
    const orderDate = new Date(createdAt);
    const now = new Date();

    if (dateFilter === 'day') {
      return orderDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return orderDate >= oneWeekAgo;
    } else if (dateFilter === 'month') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    } else if (dateFilter === 'year') {
      return orderDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredOrders = (orders || [])
    .filter(
      (order) =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.tableNumber &&
          order.tableNumber.toString().includes(searchTerm)),
    )
    .filter(
      (order) =>
        orderTypeFilter === 'all' || order.orderType === orderTypeFilter,
    )
    .filter((order) => statusFilter === 'all' || order.status === statusFilter)
    .filter((order) => filterByDate(order.createdAt));

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div className='p-6 min-h-screen bg-gray-100'>
      <div className='max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md'>
        <h1 className='text-3xl font-bold mb-6 text-center text-gray-800'>
          Order Management
        </h1>

        {/* Filters */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <input
            type='text'
            placeholder='Search by customer, type, or table...'
            className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className='w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
          >
            <option value='all'>All Types</option>
            <option value='dine-in'>Dine-In</option>
            <option value='delivery'>Delivery</option>
          </select>
          <select
            className='w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value='all'>All Time</option>
            <option value='day'>Today</option>
            <option value='week'>This Week</option>
            <option value='month'>This Month</option>
            <option value='year'>This Year</option>
          </select>
          <select
            className='w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value='all'>All Status</option>
            <option value='pending'>Pending</option>
            <option value='in-progress'>In Progress</option>
            <option value='completed'>Completed</option>
            <option value='cancelled'>Cancelled</option>
            <option value='delivered'>Delivered</option>
          </select>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className='text-center py-8'>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>No orders found</div>
        ) : (
          <div className='space-y-4'>
            {filteredOrders.map((order) => (
              <div key={order._id} className='border rounded-lg p-4 bg-gray-50'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h3 className='font-semibold text-lg'>
                      {order.customerName}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      {order.orderType === 'dine-in'
                        ? `Table ${order.tableNumber}`
                        : order.orderType}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                    {order.sentToKOT && (
                      <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                        KOT Sent
                      </span>
                    )}
                  </div>
                </div>

                <div className='mb-3'>
                  <h4 className='font-medium mb-2'>Items:</h4>
                  <div className='space-y-1'>
                    {order.items.map((item, index) => (
                      <div key={index} className='flex justify-between text-sm'>
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className='border-t pt-2 mt-2'>
                    <div className='flex justify-between font-semibold'>
                      <span>Total:</span>
                      <span>Rs. {order.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className='flex gap-2 flex-wrap'>
                  {!order.sentToKOT && (
                    <button
                      onClick={() => handleSendToKOT(order._id)}
                      className='px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600'
                    >
                      Send to KOT
                    </button>
                  )}

                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleChangeStatus(order._id, e.target.value)
                    }
                    disabled={updatingStatus === order._id}
                    className='px-3 py-1 border rounded text-sm'
                  >
                    <option value='pending'>Pending</option>
                    <option value='in-progress'>In Progress</option>
                    <option value='completed'>Completed</option>
                    <option value='cancelled'>Cancelled</option>
                    <option value='delivered'>Delivered</option>
                  </select>

                  <button
                    onClick={() => handleGenerateBill(order)}
                    className='px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600'
                  >
                    Generate Bill
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className='flex justify-between items-center mt-6'>
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className='px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50'
          >
            Previous
          </button>
          <span className='text-sm text-gray-600'>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className='px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50'
          >
            Next
          </button>
        </div>
      </div>

      {/* Bill Modal */}
      {billData && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg max-w-md w-full mx-4'>
            <div ref={billRef} id='bill-content'>
              <h2 className='text-xl font-bold mb-4 text-center'>Bill</h2>
              <div className='mb-4'>
                <p>
                  <strong>Customer:</strong> {billData.customer}
                </p>
                {billData.table && (
                  <p>
                    <strong>Table:</strong> {billData.table}
                  </p>
                )}
                <p>
                  <strong>Type:</strong> {billData.orderType}
                </p>
              </div>
              <div className='space-y-2 mb-4'>
                {billData.orders.map((order, index) => (
                  <div key={index}>
                    <h4 className='font-medium'>Order #{index + 1}</h4>
                    {order.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className='flex justify-between text-sm'
                      >
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className='border-t pt-2'>
                <div className='flex justify-between font-bold'>
                  <span>Total:</span>
                  <span>Rs. {billData.total}</span>
                </div>
              </div>
            </div>
            <div className='flex gap-2 mt-4 no-print'>
              <button
                onClick={handlePrint}
                className='flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600'
              >
                Print
              </button>
              <button
                onClick={() => setBillData(null)}
                className='flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
