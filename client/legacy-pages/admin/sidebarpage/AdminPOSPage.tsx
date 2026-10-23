// @ts-nocheck
import React, { useEffect, useState } from 'react';
import POSPanel from '@/components/admin/POSPanel';
import { useMenu } from '@/hooks/custumer/useMenu';
import usePOSCart from '@/hooks/usePOSCart';
import { useTables } from '@/hooks/useBill';
import { useSearchParams } from '@/lib/router';

const AdminPOSPage = () => {
  const { tables } = useTables();
  const [selectedTable, setSelectedTable] = useState('');
  const [searchParams] = useSearchParams();

  const {
    cart,
    addToCart: originalAddToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
    subtotal,
    discount,
    setDiscount,
    total,
    setTotal,
    cashPaid,
    setCashPaid,
    creditAmount,
    onlineAmount,
    setOnlineAmount,
    change,
    customerName,
    setCustomerName,
    customerNumber,
    setCustomerNumber,
  } = usePOSCart();

  const {
    filteredItems,
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    loading,
    error,
  } = useMenu();

  // Get table from URL parameter
  useEffect(() => {
    const tableFromUrl = searchParams.get('table');
    if (tableFromUrl) {
      setSelectedTable(tableFromUrl);
    }
  }, [searchParams]);

  // Set total equal to subtotal by default
  useEffect(() => {
    setTotal(subtotal);
  }, [subtotal, setTotal]);

  // Override addToCart to ensure unique item IDs
  const addToCart = (item) => {
    const itemWithId = {
      ...item,
      id: item.id || `${item.name}-${Date.now()}`,
    };
    originalAddToCart(itemWithId);
  };

  const handlePrintBill = () => {
    clearCart();
  };

  return (
    <div className='p-6 space-y-6 max-w-5xl mx-auto'>
      <div>
        <h1 className='text-2xl font-bold mb-4'>Menu</h1>

        {/* 🔍 Filter and Search */}
        <div className='flex gap-2 mb-4'>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className='border px-2 py-1 rounded'
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type='text'
            placeholder='Search items...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='border px-2 py-1 flex-1 rounded'
          />
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2'>
            Select Table:
          </label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className='border px-3 py-2 rounded w-full max-w-xs'
          >
            <option value=''>No Table (Takeaway)</option>
            {tables.map((table) => (
              <option key={table._id} value={table.tableNumber}>
                Table {table.tableNumber}{' '}
                {table.isBooked ? '(Booked - Add Items)' : '(Available)'}
              </option>
            ))}
          </select>
        </div>

        {/* 🍽️ Menu Grid */}
        <div className='grid grid-cols-2 gap-4'>
          {loading ? (
            <p>Loading menu...</p>
          ) : error ? (
            <p className='text-red-500'>{error}</p>
          ) : filteredItems.length === 0 ? (
            <p>No items found.</p>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id || item.name}
                onClick={() => addToCart(item)}
                className='p-4 border rounded hover:bg-gray-100 text-left flex items-center gap-3'
              >
                <img
                  src={item?.image?.url || 'https://via.placeholder.com/64'}
                  alt={item?.name}
                  className='w-16 h-16 object-cover rounded'
                />
                <div>
                  <p className='font-semibold'>{item.name}</p>
                  <p className='text-sm text-gray-500'>Rs. {item.price}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 🧾 Billing Panel */}
      <POSPanel
        cart={cart}
        onIncrease={increaseQty}
        onDecrease={decreaseQty}
        onRemove={removeFromCart}
        onPrintBill={handlePrintBill}
        subtotal={subtotal}
        discount={discount}
        setDiscount={setDiscount}
        total={total}
        cashPaid={cashPaid}
        setCashPaid={setCashPaid}
        creditAmount={creditAmount}
        onlineAmount={onlineAmount}
        setOnlineAmount={setOnlineAmount}
        change={change}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerNumber={customerNumber}
        setCustomerNumber={setCustomerNumber}
        selectedTable={selectedTable}
      />
    </div>
  );
};

export default AdminPOSPage;
