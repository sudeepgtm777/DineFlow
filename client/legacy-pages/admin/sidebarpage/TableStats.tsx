import React, { useState } from 'react';
import { useTables } from '@/hooks/useTables';
import { useBill } from '@/hooks/useBill';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from '@/lib/router';
import api from '@/lib/axios';
import 'react-toastify/dist/ReactToastify.css';
import { endpoints } from "@/lib/api/endpoints";
import { MoreVertical } from 'lucide-react';

const TableManager = () => {
  const {
    tables,
    loading: tableLoading,
    releaseTable,
    fetchTables,
  } = useTables();

  const { billData, showModal, fetchBill, setShowModal } = useBill();
  const [newTableNumber, setNewTableNumber] = useState('');
  const [creatingTable, setCreatingTable] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<any>(null); // Track dropdown toggle
  const navigate = useNavigate();

  const handlePrint = () => window.print();

  const handleViewOrders = (tableNumber) => {
    fetchBill(tableNumber);
    navigate(`/admin/orders/${tableNumber}`);
  };

  const handleCreateTable = async () => {
    if (!newTableNumber || isNaN(Number(newTableNumber))) {
      toast.warning('Please enter a valid table number');
      return;
    }

    try {
      setCreatingTable(true);
      await api.post(
        `${endpoints.table}/createtable`,
        { tableNumber: Number(newTableNumber) },
        { withCredentials: true },
      );
      toast.success('Table created successfully');
      setNewTableNumber('');
      await fetchTables();
    } catch (err) {
      console.error('Create table error:', err);
      toast.error(err?.response?.data?.message || 'Failed to create table');
    } finally {
      setCreatingTable(false);
    }
  };

  const handleToggleBooking = async (tableId, currentStatus) => {
    try {
      await api.put(
        `${endpoints.table}/toggle-booking/${tableId}`,
        { isBooked: !currentStatus },
        { withCredentials: true },
      );
      toast.success(
        `Table ${!currentStatus ? 'booked' : 'unbooked'} successfully`,
      );
      await fetchTables();
    } catch (err) {
      console.error('Toggle booking error:', err);
      toast.error(
        err?.response?.data?.message || 'Failed to update table status',
      );
    }
  };

  const handleDeleteTable = async (tableId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this table?',
    );
    if (!confirmed) return;

    try {
      await api.delete(`${endpoints.table}/delete/${tableId}`, {
        withCredentials: true,
      });
      toast.success('Table deleted successfully');
      await fetchTables();
    } catch (err) {
      console.error('Delete table error:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete table');
    }
  };

  return (
    <div className='p-6'>
      <ToastContainer />
      <h2 className='text-2xl font-bold mb-4'>Table Manager</h2>

      {/* Create Table UI */}
      <div className='mb-6 flex flex-col sm:flex-row items-center gap-3'>
        <input
          type='number'
          inputMode='numeric'
          min='1'
          placeholder='Enter Table Number'
          value={newTableNumber}
          onChange={(e) => setNewTableNumber(e.target.value)}
          className='border border-gray-300 rounded px-3 py-2 w-full sm:w-64'
        />
        <button
          onClick={handleCreateTable}
          disabled={creatingTable}
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
        >
          {creatingTable ? 'Creating...' : 'Create Table'}
        </button>
      </div>

      {/* Table List */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {(tables || []).map((table) => (
          <div
            key={table?._id}
            className={`relative p-4 rounded-xl shadow-md border ${
              table?.isBooked
                ? 'bg-red-100 border-red-400'
                : 'bg-green-100 border-green-400'
            }`}
          >
            {/* Dropdown menu button */}
            <div className='absolute top-2 right-2'>
              <button
                onClick={() =>
                  setDropdownOpenId((prevId) =>
                    prevId === table._id ? null : table._id,
                  )
                }
              >
                <MoreVertical className='w-5 h-5 text-gray-700' />
              </button>

              {/* Dropdown */}
              {dropdownOpenId === table._id && (
                <div className='absolute right-0 mt-2 bg-white border rounded shadow z-10'>
                  <button
                    onClick={() =>
                      handleToggleBooking(table._id, table.isBooked)
                    }
                    className='block w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-100 text-left'
                  >
                    {table.isBooked ? 'Mark as Available' : 'Mark as Booked'}
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table._id)}
                    className='block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100 text-left'
                  >
                    Delete Table
                  </button>
                </div>
              )}
            </div>

            <h3 className='text-xl font-semibold mb-2'>
              Table {String(table?.tableNumber)}
            </h3>

            {table?.qrImage?.url && (
              <img
                src={table.qrImage.url}
                alt={`QR for Table ${table.tableNumber}`}
                className='w-24 h-24 object-contain mb-2 border'
              />
            )}

            <p className='mb-1'>
              Status:{' '}
              <span
                className={table?.isBooked ? 'text-red-600' : 'text-green-600'}
              >
                {table?.isBooked ? 'Booked' : 'Available'}
              </span>
            </p>

            {table?.isBooked && (
              <>
                <div className='flex flex-wrap gap-2'>
                  <button
                    onClick={() => handleViewOrders(table?.tableNumber)}
                    className='bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700'
                  >
                    View Orders
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/admin/pos?table=${table?.tableNumber}`)
                    }
                    className='bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700'
                  >
                    Add Items
                  </button>

                  <button
                    onClick={() => releaseTable(table?.tableNumber)}
                    disabled={tableLoading}
                    className='bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50'
                  >
                    Release
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Bill Modal */}
      {showModal && billData && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div className='bg-white w-full max-w-md p-6 rounded-xl shadow-lg print:w-full print:max-w-none print:shadow-none print:bg-white'>
            <h3 className='text-xl font-bold mb-4'>
              Bill - Table {String(billData?.tableNumber ?? 'N/A')}
            </h3>
            <p className='mb-2'>
              Customer:{' '}
              {typeof billData?.customerName === 'string'
                ? billData.customerName
                : billData?.customerName?.name || 'N/A'}
            </p>
            <table className='w-full mb-4'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left'>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {(billData?.items || []).map((item, idx) => (
                  <tr key={idx} className='border-b'>
                    <td>{String(item?.name)}</td>
                    <td className='text-center'>{String(item?.quantity)}</td>
                    <td className='text-right'>Rs. {String(item?.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className='text-right font-semibold mb-4'>
              Total: Rs. {billData?.total?.toFixed(2)}
            </p>
            <div className='flex justify-end gap-2 print:hidden'>
              <button
                onClick={handlePrint}
                className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
              >
                Print
              </button>
              <button
                onClick={() => setShowModal(false)}
                className='bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500'
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

export default TableManager;
