import Order from '../models/order.model';
import Table from '../models/table.model';
import QRCode from 'qrcode';
import cloudinary from '../utils/cloudinary';
import fs from 'fs';
import path from 'path';

export const createTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;

    // Validate input
    if (!tableNumber) {
      return res
        .status(400)
        .json({ message: 'Valid table number is required.' });
    }

    // Check if table already exists
    const existing = await Table.findOne({ tableNumber });
    if (existing) {
      return res.status(400).json({ message: 'Table already exists.' });
    }

    // Create table entry
    const table = new Table({ tableNumber });

    // Generate QR code URL
    const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order?table=${tableNumber}`;

    // Use OS-independent temp file path
    const tempDir = path.resolve('./tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const filePath = path.join(tempDir, `table-${tableNumber}.png`);

    // Generate QR code and save locally
    await QRCode.toFile(filePath, qrUrl);

    // Convert image to base64
    const fileBuffer = fs.readFileSync(filePath);
    const fileUri = `data:image/png;base64,${fileBuffer.toString('base64')}`;

    // Upload to Cloudinary
    const cloudResponse = await cloudinary.uploader.upload(fileUri, {
      folder: 'tableQRCodes',
      public_id: `table-${tableNumber}`,
    });

    // Attach QR info to the table object
    table.qrUrl = qrUrl;
    table.qrImage = {
      url: cloudResponse.secure_url,
      public_id: cloudResponse.public_id,
    };

    // Save the updated table document
    await table.save();

    // Delete the local temp QR code image
    fs.unlinkSync(filePath);

    res.status(201).json({
      message: 'Table created with QR code.',
      table,
    });
  } catch (err) {
    console.error('Error creating table:', err);
    res
      .status(500)
      .json({ message: 'Internal server error', error: err.message });
  }
};

export const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find().populate('currentOrderId');
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTableByNumber = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const table = await Table.findOne({ tableNumber }).populate(
      'currentOrderId',
    );
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const releaseTable = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const table = await Table.findOne({ tableNumber });

    if (!table || !table.isBooked) {
      return res.status(400).json({ message: 'Table is not booked' });
    }

    // If there's no currentOrderId, allow release (table was booked but no order created)
    if (!table.currentOrderId) {
      table.isBooked = false;
      table.currentOrderId = null;
      await table.save();
      return res.json({ message: 'Table released successfully' });
    }

    // If there's an order, check if it exists and is completed
    const order = await Order.findById(table.currentOrderId);
    if (!order) {
      // Order doesn't exist, allow release
      table.isBooked = false;
      table.currentOrderId = null;
      await table.save();
      return res.json({ message: 'Table released successfully' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Order not completed yet' });
    }

    // Normal release flow
    table.isBooked = false;
    table.currentOrderId = null;
    await table.save();

    res.json({ message: 'Table released successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllTableQRCodes = async (req, res) => {
  try {
    const tables = await Table.find().select('tableNumber qrImage');
    const qrCodes = tables.map((table) => ({
      tableId: table._id,
      tableNumber: table.tableNumber,
      qrImage: table.qrImage,
    }));

    res.status(200).json({
      message: 'QR Codes fetched successfully',
      qrCodes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTableBookingStatusCounts = async (req, res) => {
  try {
    const total = await Table.countDocuments();
    const booked = await Table.countDocuments({ isBooked: true });
    const unbooked = await Table.countDocuments({ isBooked: false });

    res.status(200).json({
      message: 'Table booking status counts fetched successfully',
      totalTables: total,
      bookedTables: booked,
      unbookedTables: unbooked,
    });
  } catch (error) {
    console.error('Error fetching table booking counts:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const { tableId } = req.params;

    const table = await Table.findById(tableId);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (table.isBooked) {
      return res.status(400).json({ message: 'Cannot delete a booked table' });
    }

    if (table.qrImage?.public_id) {
      await cloudinary.uploader.destroy(table.qrImage.public_id);
    }

    await Table.findByIdAndDelete(tableId);

    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (err) {
    console.error('Error deleting table:', err);
    res
      .status(500)
      .json({ message: 'Internal server error', error: err.message });
  }
};

export const toggleTableBooking = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { isBooked } = req.body;

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // If unbooking, clear the current order
    if (!isBooked) {
      table.currentOrderId = null;
    }

    table.isBooked = isBooked;
    await table.save();

    res.status(200).json({
      message: `Table ${isBooked ? 'booked' : 'unbooked'} successfully`,
      table,
    });
  } catch (error) {
    console.error('Error toggling table booking:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
