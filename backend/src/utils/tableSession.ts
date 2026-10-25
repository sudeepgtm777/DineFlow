import Order from '../models/order.model';
import Table from '../models/table.model';

export const getSessionOrders = async (tableNumber, sessionId) => {
  if (!sessionId) return [];
  return Order.find({
    tableNumber: String(tableNumber),
    orderType: 'dine-in',
    bookingSessionId: sessionId,
    status: { $nin: ['cancelled'] },
  }).sort({ createdAt: 1 });
};

export const sessionHasUnbilledOrders = async (tableNumber, sessionId) => {
  if (!sessionId) return false;
  const open = await Order.exists({
    tableNumber: String(tableNumber),
    orderType: 'dine-in',
    bookingSessionId: sessionId,
    status: { $nin: ['cancelled'] },
    billed: { $ne: true },
  });
  return Boolean(open);
};

export const getTableSessionId = async (table) => {
  if (!table?.currentOrderId) return null;
  const current = await Order.findById(table.currentOrderId);
  return current?.bookingSessionId || null;
};

export const syncTableOccupancy = async (table) => {
  if (!table) return table;
  const sessionId = await getTableSessionId(table);
  if (!sessionId) {
    table.isBooked = false;
    table.currentOrderId = null;
    await table.save();
    return table;
  }

  const orders = await getSessionOrders(table.tableNumber, sessionId);
  if (orders.length === 0) {
    table.isBooked = false;
    table.currentOrderId = null;
    await table.save();
    return table;
  }

  const unbilled = orders.filter((order) => !order.billed);
  const stillOccupied = unbilled.length > 0;
  table.isBooked = stillOccupied || orders.length > 0;
  table.currentOrderId =
    (unbilled[unbilled.length - 1] || orders[orders.length - 1])._id;

  if (!stillOccupied) {
    // Session still exists until release; keep booked while any non-cancelled ticket remains.
    table.isBooked = true;
  }
  await table.save();
  return table;
};

export const releaseIfSessionSettled = async (table) => {
  if (!table) return { released: false, table };
  const sessionId = await getTableSessionId(table);
  if (!sessionId) {
    table.isBooked = false;
    table.currentOrderId = null;
    await table.save();
    return { released: true, table };
  }

  const stillUnbilled = await sessionHasUnbilledOrders(
    table.tableNumber,
    sessionId,
  );
  if (stillUnbilled) {
    return { released: false, table };
  }

  table.isBooked = false;
  table.currentOrderId = null;
  await table.save();
  return { released: true, table };
};
