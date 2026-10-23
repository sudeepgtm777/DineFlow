// @ts-nocheck
import express from "express";
import {
  createRoom,
  getAllRooms,
  getRoomByNumber,
  checkInRoom,
  checkOutRoom,
  deleteRoom,
  updateRoom,
  deleteRoomPhoto,
} from "../controllers/room.controller";

import isAuthenticated from "../middlewares/isAuthenticated";
import { multipleUpload } from "../middlewares/mutler";

const router = express.Router();

// Create room with multiple image uploads
router.post("/create", isAuthenticated, multipleUpload, createRoom);

// Get all rooms
router.get("/getrooms", getAllRooms);


// Get room details by room number
router.get("/:roomNumber", getRoomByNumber);

// Check in to a room
router.put("/checkin/:roomNumber", isAuthenticated, checkInRoom);

// Book room as customer
// router.put("/book/:roomNumber",bookRoomAsCustomer);

// Check out of a room
router.put("/checkout/:roomNumber", isAuthenticated, checkOutRoom);

// Delete a room
router.delete("/delete/:roomId", isAuthenticated, deleteRoom);

// Update room details
router.put("/update/:roomId", isAuthenticated, multipleUpload, updateRoom);

// Delete a room photo
router.delete("/deletephoto/:roomId", isAuthenticated, deleteRoomPhoto);

export default router;
