import Room from "../models/room.model";
import Order from "../models/order.model";
import QRCode from "qrcode";
import cloudinary from "../utils/cloudinary";
import fs from "fs";
import path from "path";

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      capacity,
      pricePerNight,
      amenities = [],
    } = req.body;

    // Basic validation
    if (!roomNumber || !roomType || !pricePerNight) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check if room already exists
    const existing = await Room.findOne({ roomNumber });
    if (existing) {
      return res.status(400).json({ message: "Room already exists." });
    }

    // Create room instance
    const room = new Room({
      roomNumber,
      roomType,
      capacity: capacity || 2,
      pricePerNight,
      amenities: Array.isArray(amenities) ? amenities : [amenities],
    });

    // Generate QR code URL for the room
    const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order?room=${roomNumber}`;

    // Generate QR code and save temporarily
    const tempDir = path.resolve("./tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const filePath = path.join(tempDir, `room-${roomNumber}.png`);

    await QRCode.toFile(filePath, qrUrl);

    // Read QR code file and convert to base64 for Cloudinary upload
    const qrFileBuffer = fs.readFileSync(filePath);
    const qrFileUri = `data:image/png;base64,${qrFileBuffer.toString("base64")}`;

    // Upload QR code image to Cloudinary
    const qrUploadResponse = await cloudinary.uploader.upload(qrFileUri, {
      folder: "roomQRCodes",
      public_id: `room-${roomNumber}`,
    });

    // Attach QR info to room
    room.qrUrl = qrUrl;
    room.qrImage = {
      url: qrUploadResponse.secure_url,
      public_id: qrUploadResponse.public_id,
    };

    // Delete temp QR code file
    fs.unlinkSync(filePath);

    // Upload multiple photos (assuming req.files is array of files from Multer)
    const photos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        const uploadResult = await cloudinary.uploader.upload(fileUri, {
          folder: "roomPhotos",
        });

        photos.push({
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        });
      }
    }

    room.photos = photos as typeof room.photos;

    // Save room document
    await room.save();

    res.status(201).json({
      message: "Room created with QR code and photos.",
      room,
    });
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("currentOrderId");
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


// Get single room by number
export const getRoomByNumber = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const room = await Room.findOne({ roomNumber }).populate("currentOrderId");
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Update/edit a room
export const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const {
      roomNumber,
      roomType,
      capacity,
      pricePerNight,
      amenities,
    } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Prevent room number conflicts
    if (roomNumber && roomNumber !== room.roomNumber) {
      const existingRoom = await Room.findOne({ roomNumber });
      if (existingRoom) {
        return res.status(400).json({ message: "Room number already exists" });
      }
    }

    // Update fields
    if (roomNumber) room.roomNumber = roomNumber;
    if (roomType) room.roomType = roomType;
    if (capacity !== undefined) room.capacity = capacity;
    if (pricePerNight) room.pricePerNight = pricePerNight;
    if (amenities) room.amenities = Array.isArray(amenities) ? amenities : [amenities];

    // Handle photo update (optional)
    if (req.files && req.files.length > 0) {
      // Delete old photos from Cloudinary
      if (room.photos && room.photos.length > 0) {
        for (const photo of room.photos) {
          await cloudinary.uploader.destroy(photo.public_id);
        }
      }

      const newPhotos = [];
      for (const file of req.files) {
        const fileUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        const uploadResult = await cloudinary.uploader.upload(fileUri, {
          folder: "roomPhotos",
        });

        newPhotos.push({
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        });
      }

      room.photos = newPhotos as typeof room.photos;
    }

    await room.save();
    res.status(200).json({ message: "Room updated successfully", room });
  } catch (err) {
    console.error("Error updating room:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


// Book room (check-in)
export const checkInRoom = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const { orderId } = req.body;

    const room = await Room.findOne({ roomNumber });
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.isBooked) return res.status(400).json({ message: "Room is already booked" });

    room.isBooked = true;
    room.currentOrderId = orderId;
    room.checkInDate = new Date();

    await room.save();
    res.status(200).json({ message: "Room checked in successfully", room });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Checkout room
export const checkOutRoom = async (req, res) => {
  try {
    const { roomNumber } = req.params;

    const room = await Room.findOne({ roomNumber });
    if (!room || !room.isBooked) {
      return res.status(400).json({ message: "Room is not booked" });
    }

    const order = await Order.findById(room.currentOrderId);
    if (!order || order.status !== "completed") {
      return res.status(400).json({ message: "Order not completed yet" });
    }

    room.isBooked = false;
    room.currentOrderId = null;
    room.checkOutDate = new Date();

    await room.save();
    res.status(200).json({ message: "Room checked out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Place a food order from the room
export const placeRoomOrder = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const { items, totalAmount, paymentMethod } = req.body;

    const room = await Room.findOne({ roomNumber });
    if (!room || !room.isBooked) {
      return res.status(400).json({ message: "Room is not booked" });
    }

    const order = new Order({
      items,
      totalAmount,
      paymentMethod,
      roomNumber,
      status: "pending",
    });

    await order.save();

    room.currentOrderId = order._id;
    await room.save();

    res.status(201).json({ message: "Food order placed", order });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Delete a room
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.isBooked) {
      return res.status(400).json({ message: "Cannot delete a booked room" });
    }

    if (room.qrImage?.public_id) {
      await cloudinary.uploader.destroy(room.qrImage.public_id);
    }

    if (room.photos && room.photos.length > 0) {
      for (const photo of room.photos) {
        await cloudinary.uploader.destroy(photo.public_id);
      }
    }

    await Room.findByIdAndDelete(roomId);
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Booking status stats
export const getRoomBookingStatusCounts = async (req, res) => {
  try {
    const total = await Room.countDocuments();
    const booked = await Room.countDocuments({ isBooked: true });
    const available = await Room.countDocuments({ isBooked: false });

    res.status(200).json({
      totalRooms: total,
      bookedRooms: booked,
      availableRooms: available,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Delete a specific room photo
export const deleteRoomPhoto = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: "public_id is required to delete the photo" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Check if photo exists in room
    const photoExists = room.photos.find((photo) => photo.public_id === public_id);
    if (!photoExists) {
      return res.status(404).json({ message: "Photo not found in this room" });
    }

    // Remove from Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Remove from DB
    room.photos = room.photos.filter((photo) => photo.public_id !== public_id) as typeof room.photos;

    await room.save();
    res.status(200).json({ message: "Photo deleted successfully", room });
  } catch (err) {
    console.error("Error deleting photo:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};



// Book a room as a customer
// export const bookRoomAsCustomer = async (req, res) => {
//   try {
//     const { roomNumber } = req.params;
//     const { customerName, contactNumber } = req.body;

//     // Validate inputs
//     if (!customerName || !contactNumber) {
//       return res.status(400).json({ message: "Customer name and contact number are required." });
//     }

//     // Find the room by room number
//     const room = await Room.findOne({ roomNumber });
//     if (!room) return res.status(404).json({ message: "Room not found." });

//     if (room.isBooked) {
//       return res.status(400).json({ message: "Room is already booked." });
//     }

//     // Attach customer info and mark the room as booked
//     room.isBooked = true;
//     room.checkInDate = new Date();
//     room.customerInfo = {
//       name: customerName,
//       contact: contactNumber,
//     };

//     await room.save();

//     res.status(200).json({
//       message: "Room booked successfully.",
//       room,
//     });
//   } catch (err) {
//     console.error("Error booking room:", err);
//     res.status(500).json({ message: "Internal server error", error: err.message });
//   }
// };
