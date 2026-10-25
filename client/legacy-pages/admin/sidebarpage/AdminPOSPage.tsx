import React, { useEffect, useState } from 'react';
import POSPanel from '@/components/admin/POSPanel';
import { useMenu } from '@/hooks/customer/useMenu';
import usePOSCart from '@/hooks/usePOSCart';
import { useTables } from '@/hooks/useTables';
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
    const menuId = item._id || item.id;
    originalAddToCart({
      ...item,
      id: menuId,
      _id: menuId,
    });
  };

  return (
    <div className='p-6 space-y-6 max-w-5xl mx-auto'>
      <div>
        <h1 className='text-2xl font-bold mb-4'>Menu</h1>

        {/* 🔍 Filter and Search */}
        <div className='flex flex-col sm:flex-row gap-3 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Category
            </label>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className='w-full sm:w-48 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none'
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Search
            </label>
            <input
              type='text'
              placeholder='Search items...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none'
            />
          </div>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Select table
          </label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className='w-full max-w-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none'
          >
            <option value=''>No Table (Takeaway)</option>
            <optgroup label='Available to seat'>
              {tables
                .filter((table) => !table.isBooked)
                .map((table) => (
                  <option key={table._id} value={table.tableNumber}>
                    Table {table.tableNumber}
                  </option>
                ))}
            </optgroup>
            <optgroup label='Occupied (add items)'>
              {tables
                .filter((table) => table.isBooked)
                .map((table) => (
                  <option key={table._id} value={table.tableNumber}>
                    Table {table.tableNumber}
                  </option>
                ))}
            </optgroup>
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
                key={item._id || item.id || item.name}
                onClick={() => addToCart(item)}
                className='p-4 border rounded hover:bg-gray-100 text-left flex items-center gap-3'
              >
                <img
                  src={item?.image?.url || '/logo-mark.svg'}
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
