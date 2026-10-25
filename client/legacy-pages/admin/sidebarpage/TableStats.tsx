import React, { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTables } from '@/hooks/useTables';
import { toast } from 'react-toastify';
import { useNavigate } from '@/lib/router';
import api from '@/lib/axios';
import 'react-toastify/dist/ReactToastify.css';
import { endpoints } from "@/lib/api/endpoints";
import { GripVertical, MoreVertical } from 'lucide-react';

const SortableTableCard = ({
  table,
  tableLoading,
  dropdownOpenId,
  setDropdownOpenId,
  onToggleBooking,
  onDeleteTable,
  onViewOrders,
  onAddItems,
  onRelease,
}: {
  table: any;
  tableLoading: boolean;
  dropdownOpenId: any;
  setDropdownOpenId: React.Dispatch<React.SetStateAction<any>>;
  onToggleBooking: (tableId: string, currentStatus: boolean) => void;
  onDeleteTable: (tableId: string) => void;
  onViewOrders: (tableNumber: string) => void;
  onAddItems: (tableNumber: string) => void;
  onRelease: (tableNumber: string) => void;
}) => {
  const tableId = String(table._id);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tableId });

  const isMenuOpen = dropdownOpenId === table._id;
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging || isMenuOpen ? 30 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative overflow-visible p-4 rounded-xl shadow-md border ${
        table?.isBooked
          ? 'bg-red-100 border-red-400'
          : 'bg-green-100 border-green-400'
      } ${isDragging ? 'shadow-lg ring-2 ring-indigo-300' : ''}`}
    >
      <div className='absolute top-2 right-2 flex items-center gap-1'>
        <button
          type='button'
          className='inline-flex items-center justify-center rounded-md p-1 text-gray-500 hover:bg-white/70 hover:text-gray-800 cursor-grab'
          {...attributes}
          {...listeners}
        >
          <GripVertical className='w-5 h-5' />
          <span className='sr-only'>Drag table to reorder</span>
        </button>
        <div className='relative' data-card-menu>
          <button
            type='button'
            onClick={() =>
              setDropdownOpenId((prevId) =>
                prevId === table._id ? null : table._id,
              )
            }
          >
            <MoreVertical className='w-5 h-5 text-gray-700' />
          </button>

          {isMenuOpen && (
            <div className='absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-30 w-44'>
              <button
                type='button'
                onClick={() => onToggleBooking(table._id, table.isBooked)}
                className='block w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-100 text-left'
              >
                {table.isBooked ? 'Mark as Available' : 'Mark as Occupied'}
              </button>
              <button
                type='button'
                onClick={() => onDeleteTable(table._id)}
                className='block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100 text-left'
              >
                Delete Table
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className='text-xl font-semibold mb-2 pr-16'>
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
        <span className={table?.isBooked ? 'text-red-600' : 'text-green-600'}>
          {table?.isBooked ? 'Occupied' : 'Available'}
        </span>
      </p>

      {table?.isBooked && (
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => onViewOrders(table?.tableNumber)}
            className='bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700'
          >
            View Orders
          </button>

          <button
            type='button'
            onClick={() => onAddItems(table?.tableNumber)}
            className='bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700'
          >
            Add Items
          </button>

          <button
            type='button'
            onClick={() => onRelease(table?.tableNumber)}
            disabled={tableLoading}
            className='bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50'
          >
            Release
          </button>
        </div>
      )}
    </div>
  );
};

const TableManager = () => {
  const {
    tables,
    setTables,
    loading: tableLoading,
    releaseTable,
    fetchTables,
    reorderTables,
  } = useTables();

  const [newTableNumber, setNewTableNumber] = useState('');
  const [creatingTable, setCreatingTable] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!dropdownOpenId) return;

    const closeIfOutside = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-card-menu]')) return;
      setDropdownOpenId(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDropdownOpenId(null);
    };

    document.addEventListener('pointerdown', closeIfOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [dropdownOpenId]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleViewOrders = (tableNumber) => {
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
    setDropdownOpenId(null);
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
    setDropdownOpenId(null);
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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = tables.findIndex(
        (table) => String(table._id) === String(active.id),
      );
      const newIndex = tables.findIndex(
        (table) => String(table._id) === String(over.id),
      );
      if (oldIndex < 0 || newIndex < 0) return;

      const previous = tables;
      const reordered = arrayMove(tables, oldIndex, newIndex);
      setTables(reordered);
      void reorderTables(reordered.map((table) => String(table._id)))
        .then(() => toast.success('Tables reordered'))
        .catch((err) => {
          toast.error(
            err?.response?.data?.message || 'Failed to reorder tables',
          );
          setTables(previous);
          void fetchTables();
        });
    },
    [tables, setTables, reorderTables, fetchTables],
  );

  return (
    <div className='p-6'>
      <h2 className='text-2xl font-bold mb-4'>Table Manager</h2>

      <div className='mb-6 flex flex-col sm:flex-row sm:items-end gap-3'>
        <div>
          <label className='block text-gray-700 text-sm font-medium mb-1'>
            Table number
          </label>
          <input
            type='number'
            inputMode='numeric'
            min='1'
            placeholder='e.g. 14'
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className='w-full sm:w-64 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none'
          />
        </div>
        <button
          onClick={handleCreateTable}
          disabled={creatingTable}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50'
        >
          {creatingTable ? 'Creating...' : 'Create Table'}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={() => setDropdownOpenId(null)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={(tables || []).map((table) => String(table._id))}
          strategy={rectSortingStrategy}
        >
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {(tables || []).map((table) => (
              <SortableTableCard
                key={table?._id}
                table={table}
                tableLoading={tableLoading}
                dropdownOpenId={dropdownOpenId}
                setDropdownOpenId={setDropdownOpenId}
                onToggleBooking={handleToggleBooking}
                onDeleteTable={handleDeleteTable}
                onViewOrders={handleViewOrders}
                onAddItems={(tableNumber) =>
                  navigate(`/admin/pos?table=${tableNumber}`)
                }
                onRelease={releaseTable}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default TableManager;
