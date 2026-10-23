// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiHome,
  FiMenu,
  FiX,
  FiList,
} from 'react-icons/fi';
import { useNavigate, useSearchParams } from '@/lib/router';
import useCart from '@/hooks/custumer/useCart';
import { useMenu } from '@/hooks/custumer/useMenu';
import { useMobileMenu } from '@/hooks/custumer/useMobileMenu';
import { endpoints } from "@/lib/api/endpoints";
import Logo from '@/components/brand/Logo';

const GuestUserDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');

  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
    clearCart,
  } = useCart();

  const {
    menuItems = [],
    categories = [],
    filteredItems = [],
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
  } = useMenu();

  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

  const [activeOrder, setActiveOrder] = useState(null);
  const [error, setError] = useState(null);

  // Fetch active order for other functionality (e.g., active orders page)
  useEffect(() => {
    if (!tableNumber) return;

    const fetchActiveOrder = async () => {
      try {
        const response = await fetch(
          `${endpoints.order}/orders/active?tableNumber=${tableNumber}`,
        );
        const data = await response.json();
        if (response.ok && data.order) {
          setActiveOrder(data.order);
        } else {
          setActiveOrder(null);
        }
      } catch (err) {
        console.error('Error fetching active order:', err);
        setError('Failed to fetch active order');
      }
    };

    fetchActiveOrder();
  }, [tableNumber]);

  // Handle proceeding to checkout for cart items
  const handleProceedToCheckout = () => {
    if (!tableNumber) {
      alert('Missing table number.');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    navigate(`/guest-checkout?table=${tableNumber}`);
  };

  // Navigate to active orders page
  const handleViewActiveOrders = () => {
    navigate(`/active-orders?table=${tableNumber}`);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm sticky top-0 z-10'>
        <div className='container mx-auto px-4 py-3 flex justify-between items-center'>
          <div className='flex items-center'>
            <button
              className='md:hidden mr-4 text-gray-600'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <Logo />
          </div>

          <div className='hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 flex-1 max-w-md mx-6'>
            <FiSearch className='text-gray-500 mr-2' />
            <input
              type='text'
              placeholder='Search menu...'
              className='bg-transparent border-none outline-none w-full'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className='flex items-center'>
            <button
              className='p-2 text-gray-600 hover:text-indigo-600'
              onClick={handleViewActiveOrders}
              title='View Active Orders'
            >
              <FiList size={22} />
            </button>
            <button
              className='relative p-2 text-gray-600 hover:text-indigo-600 ml-4'
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <FiShoppingCart size={22} />
              {totalItems > 0 && (
                <span className='absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                  {totalItems}
                </span>
              )}
            </button>
            <button className='ml-4 p-2 text-gray-600 hover:text-indigo-600'>
              <FiUser size={22} />
            </button>
          </div>
        </div>

        <div className='md:hidden px-4 pb-3'>
          <div className='flex items-center bg-gray-100 rounded-full px-4 py-2'>
            <FiSearch className='text-gray-500 mr-2' />
            <input
              type='text'
              placeholder='Search menu...'
              className='bg-transparent border-none outline-none w-full'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className='md:hidden bg-white shadow-lg absolute z-20 w-full'>
          <div className='container mx-auto px-4 py-3'>
            <nav className='flex flex-col space-y-2'>
              <button className='flex items-center py-2 px-4 rounded-lg hover:bg-gray-100'>
                <FiHome className='mr-2' /> Home
              </button>
              {categories.map((category, index) => (
                <button
                  key={`${category}-${index}`}
                  className={`flex items-center py-2 px-4 rounded-lg hover:bg-gray-100 ${
                    activeCategory === category
                      ? 'text-indigo-600 font-medium bg-indigo-50'
                      : ''
                  }`}
                  onClick={() => {
                    setActiveCategory(category);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {category}
                </button>
              ))}
              <button
                className='flex items-center py-2 px-4 rounded-lg hover:bg-gray-100'
                onClick={() => {
                  handleViewActiveOrders();
                  setIsMobileMenuOpen(false);
                }}
              >
                <FiList className='mr-2' /> Active Orders
              </button>
            </nav>
          </div>
        </div>
      )}

      <main className='container mx-auto px-4 py-6'>
        <div className='flex overflow-x-auto pb-4 mb-6 scrollbar-hide'>
          <div className='flex space-x-2'>
            {categories.map((category, index) => (
              <button
                key={`${category}-${index}`}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full whitespace-nowrap text-sm md:text-base ${
                  activeCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6'>
          {filteredItems.length === 0 ? (
            <div className='col-span-full text-center py-12'>
              <h3 className='text-lg md:text-xl font-medium text-gray-600'>
                No items found
              </h3>
              <p className='text-gray-500 mt-2 text-sm md:text-base'>
                Try a different search or category
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={item._id ?? item.id ?? `${item.name}-${index}`}
                className='bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow'
              >
                <div className='relative h-24 sm:h-28 md:h-36 lg:h-48 overflow-hidden'>
                  <img
                    src={item?.image?.url}
                    alt={item.name}
                    className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                  />
                  <span className='absolute top-1 right-1 bg-indigo-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-full'>
                    {item.category}
                  </span>
                </div>
                <div className='p-2 sm:p-3'>
                  <div className='flex justify-between items-start mb-1'>
                    <h3 className='text-xs sm:text-sm font-bold text-gray-800 line-clamp-1'>
                      {item.name}
                    </h3>
                    <span className='text-xs sm:text-sm font-bold text-indigo-600'>
                      Rs {item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className='text-gray-500 text-[10px] sm:text-xs mb-2 line-clamp-2'>
                    {item.description}
                  </p>
                  <button
                    onClick={() =>
                      addToCart({
                        ...item,
                        quantity: 1,
                        specialInstructions: '',
                        cartItemId: `${item.id}-${Date.now()}`,
                      })
                    }
                    className='w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-2 rounded-md text-xs sm:text-sm'
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {isCartOpen && (
        <div className='fixed inset-0 z-30 overflow-hidden'>
          <div
            className='absolute inset-0 bg-black bg-opacity-50'
            onClick={() => setIsCartOpen(false)}
          ></div>
          <div className='absolute inset-y-0 right-0 max-w-full flex'>
            <div className='relative w-screen max-w-md'>
              <div className='h-full flex flex-col bg-white shadow-xl'>
                <div className='px-4 py-6 bg-indigo-600 text-white flex items-center justify-between'>
                  <h2 className='text-lg md:text-xl font-bold'>
                    Your Order ({totalItems})
                  </h2>
                  <button onClick={() => setIsCartOpen(false)}>
                    <FiX size={24} />
                  </button>
                </div>
                <div className='px-4 py-4 overflow-y-auto flex-1'>
                  {cart.length === 0 ? (
                    <div className='text-center py-8'>
                      <p className='text-gray-500'>Your order is empty</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className='mt-4 text-indigo-600 hover:text-indigo-800 font-medium'
                      >
                        Browse Menu
                      </button>
                    </div>
                  ) : (
                    <div className='divide-y divide-gray-200'>
                      {cart.map((item, index) => (
                        <div
                          key={item.cartItemId ?? item._id ?? item.id ?? `${item.name}-${index}`}
                          className='py-4 flex'
                        >
                          <div className='flex-shrink-0 h-16 w-16 rounded-md overflow-hidden'>
                            <img
                              src={
                                item?.image?.url ||
                                'https://via.placeholder.com/64'
                              }
                              alt={item.name}
                              className='h-full w-full object-cover'
                            />
                          </div>
                          <div className='ml-4 flex-1'>
                            <div className='flex justify-between'>
                              <h3 className='text-sm font-medium text-gray-800 line-clamp-1'>
                                {item.name}
                              </h3>
                              <p className='text-sm font-bold text-gray-800 ml-4'>
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <div className='mt-1 flex justify-between'>
                              <div className='flex items-center border rounded-md'>
                                <button
                                  className='px-2 py-1'
                                  onClick={() =>
                                    updateQuantity(
                                      item.cartItemId,
                                      item.quantity - 1,
                                    )
                                  }
                                >
                                  -
                                </button>
                                <span className='px-2 text-sm'>
                                  {item.quantity}
                                </span>
                                <button
                                  className='px-2 py-1'
                                  onClick={() =>
                                    updateQuantity(
                                      item.cartItemId,
                                      item.quantity + 1,
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                              <button
                                className='text-red-500 hover:text-red-700 text-sm'
                                onClick={() => removeFromCart(item.cartItemId)}
                              >
                                Remove
                              </button>
                            </div>
                            {item.specialInstructions && (
                              <p className='text-xs text-gray-500 mt-1'>
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {cart.length > 0 && (
                  <div className='border-t border-gray-200 px-4 py-4'>
                    {error && (
                      <p className='text-red-500 text-sm mb-2'>{error}</p>
                    )}
                    <div className='flex justify-between text-base md:text-lg font-bold mb-4'>
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleProceedToCheckout}
                      className='w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 md:py-3 px-4 rounded-lg font-medium'
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-10'>
        <div className='flex justify-around items-center py-3'>
          <button className='flex flex-col items-center text-indigo-600'>
            <FiHome size={20} />
            <span className='text-xs mt-1'>Home</span>
          </button>
          <button
            className='flex flex-col items-center text-gray-600'
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            <FiShoppingCart size={20} />
            <span className='text-xs mt-1'>Cart</span>
          </button>
          <button
            className='flex flex-col items-center text-gray-600'
            onClick={handleViewActiveOrders}
          >
            <FiList size={20} />
            <span className='text-xs mt-1'>Orders</span>
          </button>
          <button className='flex flex-col items-center text-gray-600'>
            <FiUser size={20} />
            <span className='text-xs mt-1'>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestUserDashboard;
