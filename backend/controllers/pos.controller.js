import posModel from '../models/pos.model.js';
import Order from '../models/order.model.js';
import Table from '../models/table.model.js';

// Create a new bill
export const createBill = async (req, res) => {
  try {
    const {
      cart,
      total,
      cash,
      credit,
      online,
      paymentMethod = 'cash',
      orderType = 'dine-in',
      customerName,
      customerNumber,
      tableNumber,
    } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart items are required' });
    }

    // Validate cart items structure
    const items = cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    // Create new POS bill record
    const newBill = await posModel.create({
      items,
      totalAmount: total,
      cash,
      credit,
      online,
      paymentMethod,
      orderType,
      customerDetails: {
        name: customerName || 'Guest',
        contact: customerNumber || '',
      },
    });

    // Create kitchen order
    const orderItems = cart.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    // Handle table booking and session management
    if (tableNumber) {
      // Check if table has existing active order
      const table = await Table.findOne({ tableNumber: String(tableNumber) });

      let sessionId;
      if (table && table.isBooked && table.currentOrderId) {
        // Get session ID from existing order
        const existingOrder = await Order.findById(table.currentOrderId);
        sessionId = existingOrder?.bookingSessionId;

        if (
          existingOrder &&
          ['pending', 'in-progress'].includes(existingOrder.status)
        ) {
          // Add items to existing order
          existingOrder.items.push(...orderItems);
          existingOrder.subtotal += total;
          await existingOrder.save();

          return res.status(201).json({
            success: true,
            bill: newBill,
            message: 'Items added to existing order',
          });
        }
      } else {
        // Generate new session ID for new booking
        sessionId = `session_${Date.now()}_${tableNumber}`;
      }

      // Create new kitchen order with session ID
      const kitchenOrder = new Order({
        customerName: customerName || 'Guest',
        items: orderItems,
        orderType: 'dine-in',
        tableNumber: String(tableNumber),
        paymentMethod: 'counter',
        subtotal: total,
        status: 'in-progress',
        sentToKOT: true,
        bookingSessionId: sessionId,
      });

      await kitchenOrder.save();

      // Update table booking
      await Table.findOneAndUpdate(
        { tableNumber: String(tableNumber) },
        {
          isBooked: true,
          currentOrderId: kitchenOrder._id,
        },
      );
    } else {
      // Takeaway order
      const kitchenOrder = new Order({
        customerName: customerName || 'Guest',
        items: orderItems,
        orderType: 'delivery',
        phoneNumber: customerNumber || '0000000000',
        deliveryAddress: 'Takeaway',
        paymentMethod: 'counter',
        subtotal: total,
        status: 'in-progress',
        sentToKOT: true,
      });

      await kitchenOrder.save();
    }

    res.status(201).json({ success: true, bill: newBill });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Failed to create bill', details: err.message });
  }
};

// Add items to existing order
export const addItemsToOrder = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const { cart, customerName, customerNumber } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart items are required' });
    }

    // Find the table and its current order
    const table = await Table.findOne({ tableNumber: String(tableNumber) });
    if (!table || !table.isBooked || !table.currentOrderId) {
      return res
        .status(400)
        .json({ error: 'No active order found for this table' });
    }

    const existingOrder = await Order.findById(table.currentOrderId);
    if (
      !existingOrder ||
      !['pending', 'in-progress'].includes(existingOrder.status)
    ) {
      return res.status(400).json({ error: 'Cannot add items to this order' });
    }

    // Add new items to existing order
    const newItems = cart.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const additionalTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    existingOrder.items.push(...newItems);
    existingOrder.subtotal += additionalTotal;
    await existingOrder.save();

    res.status(200).json({
      success: true,
      message: 'Items added to existing order',
      order: existingOrder,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Failed to add items', details: err.message });
  }
};

// Get daily sales
export const getDailySales = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sales = await posModel.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
    ]);

    res.json(sales[0] || { totalSales: 0, orders: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get daily sales' });
  }
};

// Get monthly sales
export const getMonthlySales = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const sales = await posModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
    ]);

    res.json(sales[0] || { totalSales: 0, orders: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get monthly sales' });
  }
};

// Get most sold items (Top 5)
export const getTopItems = async (req, res) => {
  try {
    const topItems = await posModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalSales: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    res.json(topItems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top items' });
  }
};

export const getTotalByPaymentType = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totals = await posModel.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          totalCash: { $sum: '$cash' },
          totalCredit: { $sum: '$credit' },
          totalOnline: { $sum: '$online' },
        },
      },
    ]);

    res.json(totals[0] || { totalCash: 0, totalCredit: 0, totalOnline: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get payment breakdown' });
  }
};

export const getAllItemsSold = async (req, res) => {
  try {
    const items = await posModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalSales: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
    ]);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item sales list' });
  }
};

export const transferCreditTo = async (req, res) => {
  try {
    const { billId, transferTo = 'cash', amount } = req.body;

    if (!['cash', 'online'].includes(transferTo)) {
      return res.status(400).json({ error: 'Invalid transfer target' });
    }

    const bill = await posModel.findById(billId);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    if (amount > bill.credit) {
      return res.status(400).json({ error: 'Insufficient credit to transfer' });
    }

    // Update the values
    bill.credit -= amount;
    bill[transferTo] += amount;

    await bill.save();

    res.json({ success: true, updatedBill: bill });
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Failed to transfer credit', details: err.message });
  }
};

export const getAllBills = async (req, res) => {
  try {
    const bills = await posModel.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
};

export const getSalesByTimeRange = async (req, res) => {
  try {
    const { range = 'today' } = req.query;

    const now = new Date();
    let startDate, endDate;

    switch (range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        break;

      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;

      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;

      default:
        return res.status(400).json({ error: 'Invalid time range' });
    }

    const sales = await posModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalCash: { $sum: '$cash' },
          totalOnline: { $sum: '$online' },
          totalCredit: { $sum: '$credit' },
          orders: { $sum: 1 },
        },
      },
    ]);

    res.json(
      sales[0] || {
        totalSales: 0,
        totalCash: 0,
        totalOnline: 0,
        totalCredit: 0,
        orders: 0,
      },
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get sales by time range' });
  }
};
