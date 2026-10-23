// @ts-nocheck
import Order from '../models/order.model';
import Table from '../models/table.model';

export const createOrder = async (req, res) => {
  try {
    const {
      customerName = 'Guest',
      items,
      orderType,
      tableNumber,
      deliveryAddress,
      specialInstructions,
      paymentMethod,
      subtotal,
    } = req.body;

    // Basic validations
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    for (let item of items) {
      if (!item.name || typeof item.name !== 'string') {
        return res
          .status(400)
          .json({ message: `Item name is required and should be a string` });
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res
          .status(400)
          .json({ message: `Item quantity must be a positive number` });
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        return res
          .status(400)
          .json({ message: `Item price must be a positive number` });
      }
    }

    if (orderType === 'dine-in') {
      if (!tableNumber) {
        return res
          .status(400)
          .json({ message: 'Table number is required for dine-in' });
      }

      // Check if table exists
      const table = await Table.findOne({ tableNumber });
      if (!table) {
        return res
          .status(404)
          .json({ message: `Table number ${tableNumber} not found` });
      }

      // Check for active orders (pending or in-progress) for the table
      const activeOrder = await Order.findOne({
        tableNumber,
        orderType: 'dine-in',
        status: { $in: ['pending', 'in-progress'] },
      });

      // if (activeOrder) {
      //   return res.status(400).json({
      //     message: `An active order (ID: ${activeOrder._id}) exists for table ${tableNumber}. Add items to the existing order.`,
      //     orderId: activeOrder._id,
      //   });
      // }

      // Check if table is booked (should be false since no active order)
      // if (table.isBooked) {
      //   return res.status(400).json({ message: `Table number ${tableNumber} is already booked` });
      // }
    }

    if (orderType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    if (!paymentMethod || !['counter', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const calculatedSubtotal =
      subtotal ||
      items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create new order
    const order = new Order({
      customerName,
      items,
      orderType,
      ...(orderType === 'dine-in' && { tableNumber }),
      ...(orderType === 'delivery' && { deliveryAddress }),
      ...(specialInstructions && { specialInstructions }),
      paymentMethod,
      subtotal: calculatedSubtotal,
    });

    const createdOrder = await order.save();

    // If dine-in, update the table
    if (orderType === 'dine-in') {
      await Table.findOneAndUpdate(
        { tableNumber },
        {
          isBooked: ['pending', 'in-progress'].includes(createdOrder.status),
          currentOrderId: createdOrder._id,
        },
        { new: true },
      );
    }

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
    // Validate new items
    if (!newItems || !Array.isArray(newItems) || newItems.length === 0) {
      return res.status(400).json({ message: 'No new items provided' });
    }

    for (let item of newItems) {
      if (!item.name || typeof item.name !== 'string') {
        return res
          .status(400)
          .json({ message: `Item name is required and should be a string` });
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res
          .status(400)
          .json({ message: `Item quantity must be a positive number` });
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        return res
          .status(400)
          .json({ message: `Item price must be a positive number` });
      }
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
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
      if (!tableNumber || order.tableNumber !== tableNumber) {
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
      if (!table.isBooked || table.currentOrderId.toString() !== orderId) {
        return res
          .status(400)
          .json({ message: 'Table is not booked for this order' });
      }
    }

    // Add new items and update subtotal
    order.items.push(...newItems);
    order.subtotal += newItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const updatedOrder = await order.save();

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
        startDate = new Date(startDate.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        const allOrders = await Order.find().sort({ createdAt: -1 });
        return res.status(200).json({
          totalOrders: allOrders.length,
          orders: allOrders,
        });
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

    // Update order status
    order.status = status;
    const updatedOrder = await order.save();

    // Handle table booking for dine-in orders
    if (order.orderType === 'dine-in' && order.tableNumber) {
      const table = await Table.findOne({ tableNumber: order.tableNumber });
      if (!table) {
        return res
          .status(404)
          .json({ message: `Table number ${order.tableNumber} not found` });
      }

      // Set isBooked based on status
      // if (status === "in-progress") {
      //   table.isBooked = true;
      // } else if (["completed", "cancelled", "delivered"].includes(status)) {
      //   table.isBooked = false;
      //   table.currentOrderId = null;
      // }

      await table.save();
    }

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

    const inProgressOrders = await Order.find({
      tableNumber,
      orderType: 'dine-in',
      status: 'in-progress',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      totalInProgress: inProgressOrders.length,
      orders: inProgressOrders,
    });
  } catch (error) {
    console.error('Error fetching in-progress orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// controllers/orderController.js
export const completeOrder = async (req, res) => {
  try {
    const { tableNumber } = req.body;

    console.log('Received tableNumber:', tableNumber);

    if (!tableNumber) {
      return res.status(400).json({ message: 'Table number is required' });
    }

    // Ensure tableNumber is treated as a string (or number, depending on your schema)
    const query = {
      tableNumber: String(tableNumber), // Convert to string to match schema
      orderType: 'dine-in',
      status: { $in: ['pending', 'in-progress'] },
    };
    console.log('Query criteria:', query);

    // Check existing orders
    const existingOrders = await Order.find(query);
    console.log('Found orders:', existingOrders);

    if (existingOrders.length === 0) {
      return res
        .status(404)
        .json({ message: 'No active orders found for table' });
    }

    // Update orders to completed
    const updateResult = await Order.updateMany(
      query,
      { $set: { status: 'completed' } },
      { new: true },
    );

    console.log('Update result:', updateResult);

    // Update table booking status
    const table = await Table.findOne({ tableNumber: String(tableNumber) });
    if (table) {
      await Table.updateOne(
        { tableNumber: String(tableNumber) },
        {
          $set: {
            isBooked: false,
            currentOrderId: null,
          },
        },
      );
      console.log('Table updated:', { tableNumber, isBooked: false });
    } else {
      console.warn(`Table ${tableNumber} not found`);
    }

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

    // Get all orders for this table (including completed ones)
    const orders = await Order.find({
      tableNumber: String(tableNumber),
      orderType: 'dine-in',
    }).sort({ createdAt: 1 });

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
