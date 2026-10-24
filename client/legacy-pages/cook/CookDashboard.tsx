import { useNavigate } from '@/lib/router';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setUser } from '@/lib/redux/authSlice';
import api from '@/lib/axios';
import { endpoints } from "@/lib/api/endpoints"; // Add endpoints.order
import { toast } from 'react-toastify';
import React, { useEffect, useState } from 'react';

const CookDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('in-progress'); // Start with in-progress
  const [newOrderNotification, setNewOrderNotification] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get(
          `${endpoints.order}/orders/filter`,
          {
            withCredentials: true,
          },
        );

        // Filter orders that are sent to KOT
        const kotOrders = response.data.orders.filter(
          (order) => order.sentToKOT === true,
        );
        setOrders(kotOrders);

        // Check for new in-progress orders
        const newInProgress = kotOrders.filter(
          (o) => o.status === 'in-progress',
        );
        if (newInProgress.length > 0) {
          setNewOrderNotification(true);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders');
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(
        `${endpoints.order}/orders/${orderId}`,
        { status: newStatus },
        { withCredentials: true },
      );

      // Update local state
      const updatedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order,
      );
      setOrders(updatedOrders);

      toast.success('Order status updated');

      if (newStatus === 'completed') {
        setNewOrderNotification(false);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleSignOut = async () => {
    try {
      const response = await api.get(`${endpoints.user}/logout`, {
        withCredentials: true,
      });

      if (response.data.success) {
        dispatch(setUser(null));
        toast.success('Signed out successfully');
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
    }
  };

  const filteredOrders = orders.filter((order) => order.status === activeTab);

  return (
    <div className='max-w-4xl mx-auto bg-gray-50 p-4 rounded-lg shadow-lg'>
      {/* Header */}
      <header className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-semibold text-gray-800'>Cook Dashboard</h1>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <span
              className={`w-3 h-3 rounded-full ${newOrderNotification ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className='text-sm text-gray-600'>
              {newOrderNotification ? 'New Order!' : 'No new orders'}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors'
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Order Tabs */}
      <nav className='flex justify-between mb-4'>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-l-lg ${activeTab === 'in-progress' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => {
            setActiveTab('in-progress');
            setNewOrderNotification(false);
          }}
        >
          In Progress ({orders.filter((o) => o.status === 'in-progress').length}
          )
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-r-lg ${activeTab === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({orders.filter((o) => o.status === 'completed').length})
        </button>
      </nav>

      {/* New Order Notification */}
      {newOrderNotification && activeTab !== 'in-progress' && (
        <div className='bg-green-200 text-green-800 p-2 rounded-md mb-4 flex justify-between items-center'>
          <span>New Order Received! 🛎️</span>
          <button
            className='text-green-800 hover:text-green-900'
            onClick={() => setActiveTab('in-progress')}
          >
            View Orders
          </button>
        </div>
      )}

      {/* Order List */}
      <div className='space-y-4'>
        {filteredOrders.length === 0 ? (
          <p className='text-gray-500 text-center py-8'>
            No orders in this category
          </p>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className='bg-white rounded-lg shadow-md overflow-hidden border border-gray-200'
            >
              {/* Order Header */}
              <div className='flex justify-between items-center p-4 bg-gray-100'>
                <div>
                  <span className='font-semibold text-gray-800'>
                    #{order._id.slice(-4)}
                  </span>
                  <span className='ml-2 text-sm text-gray-600'>
                    {order.customerName}
                  </span>
                </div>
                <span className='text-sm text-gray-500'>
                  {new Date(order.createdAt).toLocaleTimeString()}
                </span>
              </div>

              {/* Order Items */}
              <div className='p-4'>
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className='flex justify-between items-center py-2 border-b border-gray-100 last:border-0'
                  >
                    <div className='flex-1'>
                      <span className='font-medium text-gray-800'>
                        {item.name}
                      </span>
                      {item.specialInstructions && (
                        <p className='text-sm text-orange-600 italic'>
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className='flex items-center'>
                      <span className='text-gray-600 mr-4'>
                        x{item.quantity}
                      </span>
                      <span className='font-medium'>
                        Rs.{item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className='flex justify-between items-center pt-3 mt-2 border-t border-gray-200'>
                  <span className='font-medium'>Subtotal:</span>
                  <span className='font-semibold'>
                    Rs.{order.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Footer */}
              <div className='flex justify-between items-center p-4 bg-gray-50'>
                <span className='text-sm text-gray-600'>
                  {order.orderType === 'dine-in'
                    ? `Table ${order.tableNumber}`
                    : 'Takeaway'}
                </span>

                <div className='space-x-2'>
                  {order.status === 'in-progress' && (
                    <button
                      className='px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600'
                      onClick={() => handleStatusChange(order._id, 'completed')}
                    >
                      Mark as Completed
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <span className='px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-md'>
                      ✅ Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CookDashboard;
