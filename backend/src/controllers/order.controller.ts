import Order from '../models/order.model';
import Table from '../models/table.model';
import posModel from '../models/pos.model';
import resolveOrderItems from '../utils/resolveOrderItems';
import { emitOrderUpdated } from '../utils/emitOrder';
import { mapOrderTender, pickUnbilledOrders } from '../utils/tenders';
import {
  getSessionOrders,
  getTableSessionId,
  syncTableOccupancy,
} from '../utils/tableSession';

const createPosBillFromOrders = async (
  orders,
  tender: { paymentMethod?: string } = {},
) => {
  const billable = pickUnbilledOrders(orders);
  if (billable.length === 0) {
    return null;
  }

  const items = billable.flatMap((order) =>
    (order.items || []).map((item) => ({
      id: String(item._id || ''),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  );
  const totalAmount = billable.reduce(
    (sum, order) => sum + (order.subtotal || 0),
    0,
  );
  const mapped = mapOrderTender(
    tender.paymentMethod || billable[0]?.paymentMethod,
    totalAmount,
  );

  const bill = await posModel.create({
    items,
    totalAmount,
    cash: mapped.cash,
    credit: mapped.credit,
    online: mapped.online,
    paymentMethod: mapped.paymentMethod,
    orderType: billable[0]?.orderType === 'delivery' ? 'delivery' : 'dine-in',
    customerDetails: {
      name: billable[0]?.customerName || 'Guest',
      contact: billable[0]?.phoneNumber || '',
    },
  });

  await Order.updateMany(
    { _id: { $in: billable.map((order) => order._id) } },
    { $set: { billed: true } },
  );

  return bill;
};

export const createOrder = async (req, res) => {
  try {
    const {
      customerName = 'Guest',
      items,
      orderType,
      tableNumber,
      deliveryAddress,
      phoneNumber,
      specialInstructions,
      paymentMethod,
      subtotal,
    } = req.body;

    let pricedItems;
    try {
      pricedItems = await resolveOrderItems(items);
    } catch (resolveError) {
      const err = resolveError as Error & { status?: number };
      return res
        .status(err.status || 400)
        .json({ message: err.message });
    }

    let dineInTable = null;
    let bookingSessionId;
    if (orderType === 'dine-in') {
      if (!tableNumber) {
        return res
          .status(400)
          .json({ message: 'Table number is required for dine-in' });
      }

      dineInTable = await Table.findOne({ tableNumber: String(tableNumber) });
      if (!dineInTable) {
        return res
          .status(404)
          .json({ message: `Table number ${tableNumber} not found` });
      }

      if (dineInTable.isBooked && dineInTable.currentOrderId) {
        const existingOrder = await Order.findById(dineInTable.currentOrderId);
        bookingSessionId = existingOrder?.bookingSessionId;
      }
      if (!bookingSessionId) {
        bookingSessionId = `session_${Date.now()}_${tableNumber}`;
      }
    }

    if (orderType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    if (orderType === 'delivery' && !phoneNumber) {
      return res
        .status(400)
        .json({ message: 'Phone number is required for delivery' });
    }

    if (!paymentMethod || !['counter', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const calculatedSubtotal = pricedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Create new order
    const order = new Order({
      customerName,
      items: pricedItems,
      orderType,
      ...(orderType === 'dine-in' && {
        tableNumber: String(tableNumber),
        bookingSessionId,
      }),
      ...(orderType === 'delivery' && { deliveryAddress, phoneNumber }),
      ...(specialInstructions && { specialInstructions }),
      paymentMethod,
      subtotal: calculatedSubtotal,
    });

    const createdOrder = await order.save();

    // If dine-in, update the table
    if (orderType === 'dine-in') {
      await Table.findOneAndUpdate(
        { tableNumber: String(tableNumber) },
        {
          isBooked: ['pending', 'in-progress'].includes(createdOrder.status),
          currentOrderId: createdOrder._id,
        },
        { new: true },
      );
    }

    emitOrderUpdated(req, createdOrder);
    return res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error while creating order:', error);

    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        message: 'Validation failed',
        errors,
      });
    }

    res.status(500).json({ message: 'Server Error' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    // Extract pagination parameters from query
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 orders per page
    const skip = (page - 1) * limit; // Calculate number of documents to skip

    // Fetch orders with pagination
    const orders = await Order.find()
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .skip(skip)
      .limit(limit);

    // Get total number of orders for pagination metadata
    const totalOrders = await Order.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      totalOrders,
      totalPages,
      currentPage: page,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addItemToOrder = async (req, res) => {
  const { orderId } = req.params;
  const { newItems, tableNumber } = req.body;

  try {
    let pricedItems;
    try {
      pricedItems = await resolveOrderItems(newItems);
    } catch (resolveError) {
      const err = resolveError as Error & { status?: number };
      return res
        .status(err.status || 400)
        .json({ message: err.message });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.sentToKOT) {
      return res.status(400).json({
        message: 'This order was already sent to KOT. Place a new order for additional items.',
      });
    }

    // Check if order is active
    if (!['pending', 'in-progress'].includes(order.status)) {
      return res.status(400).json({
        message:
          'Cannot add items to a completed, cancelled, or delivered order',
      });
    }

    // Verify tableNumber for dine-in orders
    if (order.orderType === 'dine-in') {
      if (!tableNumber || String(order.tableNumber) !== String(tableNumber)) {
        return res
          .status(400)
          .json({ message: 'Table number mismatch or not provided' });
      }

      // Check if table is booked and linked to this order
      const table = await Table.findOne({ tableNumber });
      if (!table) {
        return res
          .status(404)
          .json({ message: `Table number ${tableNumber} not found` });
      }
      if (!table.isBooked || table.currentOrderId?.toString() !== orderId) {
        return res
          .status(400)
          .json({ message: 'Table is not booked for this order' });
      }
    }

    // Add new items and update subtotal
    order.items.push(...pricedItems);
    order.subtotal += pricedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const updatedOrder = await order.save();

    emitOrderUpdated(req, updatedOrder);
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getFilteredOrders = async (req, res) => {
  try {
    const { filter } = req.query;

    let startDate;
    const endDate = new Date();

    switch (filter) {
      case 'daily':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date();
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yearly':
        startDate = new Date();
        startDate = new Date(startDate.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // Find orders between startDate and endDate
    const filteredOrders = await Order.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      filter: filter || 'all',
      totalOrders: filteredOrders.length,
      orders: filteredOrders,
    });
  } catch (error) {
    console.error('Error fetching filtered orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const allowedStatuses = [
      'pending',
      'in-progress',
      'completed',
      'cancelled',
      'delivered',
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    if (order.orderType === 'dine-in' && order.tableNumber) {
      const table = await Table.findOne({
        tableNumber: String(order.tableNumber),
      });
      if (table) {
        await syncTableOccupancy(table);
      }
    }

    emitOrderUpdated(req, updatedOrder);
    res.status(200).json({
      message: 'Order status updated successfully.',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getActiveOrder = async (req, res) => {
  try {
    const { tableNumber } = req.query;

    if (!tableNumber) {
      return res.status(400).json({ message: 'Table number is required' });
    }

    const table = await Table.findOne({ tableNumber: String(tableNumber) });
    if (!table?.isBooked) {
      return res.status(200).json({
        totalInProgress: 0,
        orders: [],
      });
    }

    const activeOrders = await Order.find({
      tableNumber: String(tableNumber),
      orderType: 'dine-in',
      billed: { $ne: true },
      sentToKOT: { $ne: true },
      status: 'pending',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      totalInProgress: activeOrders.length,
      orders: activeOrders,
    });
  } catch (error) {
    console.error('Error fetching in-progress orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// controllers/orderController.js
export const completeOrder = async (req, res) => {
  try {
    const { tableNumber, paymentMethod } = req.body;

    if (!tableNumber) {
      return res.status(400).json({ message: 'Table number is required' });
    }

    const table = await Table.findOne({ tableNumber: String(tableNumber) });
    const sessionId = table ? await getTableSessionId(table) : null;
    const sessionOrders = sessionId
      ? await getSessionOrders(tableNumber, sessionId)
      : [];
    const existingOrders = pickUnbilledOrders(sessionOrders);

    if (existingOrders.length === 0) {
      return res
        .status(404)
        .json({ message: 'No unbilled orders found for this table session' });
    }

    await createPosBillFromOrders(existingOrders, { paymentMethod });

    const orderIds = existingOrders.map((order) => order._id);
    const updateResult = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status: 'completed', billed: true } },
    );

    if (table) {
      await syncTableOccupancy(table);
    }

    emitOrderUpdated(req, { tableNumber, completed: true });
    res.status(200).json({
      message: 'Orders completed successfully',
      modifiedCount: updateResult.modifiedCount,
      matchedCount: updateResult.matchedCount,
    });
  } catch (error) {
    console.error('Complete order error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const editOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { customerName, specialInstructions, updatedItems } = req.body;

    // Fetch order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure order is editable
    if (!['pending', 'in-progress'].includes(order.status)) {
      return res
        .status(400)
        .json({ message: 'Only pending or in-progress orders can be edited' });
    }

    if (customerName) {
      order.customerName = customerName;
    }

    if (specialInstructions) {
      order.specialInstructions = specialInstructions;
    }

    // Update existing items if provided
    if (Array.isArray(updatedItems)) {
      for (const updatedItem of updatedItems) {
        const existingItem = order.items.id(updatedItem._id);
        if (!existingItem) {
          return res.status(404).json({
            message: `Item with ID ${updatedItem._id} not found in order`,
          });
        }

        if (updatedItem.name) {
          existingItem.name = updatedItem.name;
        }

        if (
          typeof updatedItem.quantity === 'number' &&
          updatedItem.quantity > 0
        ) {
          existingItem.quantity = updatedItem.quantity;
        }

        if (typeof updatedItem.price === 'number' && updatedItem.price > 0) {
          existingItem.price = updatedItem.price;
        }
      }

      // Recalculate subtotal
      order.subtotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error editing order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const sendToKotController = async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.sentToKOT) {
      return res.status(400).json({ message: 'Order already sent to KOT' });
    }

    // Update both sentToKOT and status
    order.sentToKOT = true;
    order.status = 'in-progress'; // Change status to in-progress
    await order.save();

    emitOrderUpdated(req, order);
    res.status(200).json({ message: 'Order sent to KOT successfully', order });
  } catch (error) {
    console.error('Error sending order to KOT:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTableBill = async (req, res) => {
  try {
    const { tableNumber } = req.params;

    if (!tableNumber) {
      return res.status(400).json({ message: 'Table number is required' });
    }

    const table = await Table.findOne({ tableNumber: String(tableNumber) });
    let orders = [];

    if (table?.isBooked && table.currentOrderId) {
      const currentOrder = await Order.findById(table.currentOrderId);
      const sessionId = currentOrder?.bookingSessionId;
      if (sessionId) {
        orders = await Order.find({
          tableNumber: String(tableNumber),
          orderType: 'dine-in',
          bookingSessionId: sessionId,
          status: { $nin: ['cancelled'] },
        }).sort({ createdAt: 1 });
      }
    }

    if (orders.length === 0) {
      orders = await Order.find({
        tableNumber: String(tableNumber),
        orderType: 'dine-in',
        billed: { $ne: true },
        status: { $in: ['pending', 'in-progress', 'completed'] },
      }).sort({ createdAt: 1 });
    }

    // Calculate totals
    const grandTotal = orders.reduce((sum, order) => {
      return (
        sum +
        order.items.reduce((itemSum, item) => {
          return itemSum + item.price * item.quantity;
        }, 0)
      );
    }, 0);

    res.status(200).json({
      orders,
      grandTotal,
      tableNumber,
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error('Error fetching table bill:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// In order.controller.js
export const getCurrentSessionId = async (req, res) => {
  try {
    const { tableNumber } = req.params;

    const table = await Table.findOne({ tableNumber: String(tableNumber) });
    if (!table || !table.isBooked || !table.currentOrderId) {
      return res.status(404).json({ message: 'No active booking session' });
    }

    const currentOrder = await Order.findById(table.currentOrderId);
    if (!currentOrder) {
      return res.status(404).json({ message: 'No active order found' });
    }

    res.json({ sessionId: currentOrder.bookingSessionId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
