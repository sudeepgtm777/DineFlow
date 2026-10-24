import express from 'express';
import {
  createRoom,
  getAllRooms,
  getRoomByNumber,
  checkInRoom,
  checkOutRoom,
  deleteRoom,
  updateRoom,
  deleteRoomPhoto,
} from '../controllers/room.controller';

import isAuthenticated from '../middlewares/isAuthenticated';
import isAdmin from '../middlewares/isAdmin';
import { multipleUpload } from '../middlewares/multer';

const router = express.Router();

router.post(
  '/create',
  isAuthenticated,
  isAdmin,
  multipleUpload,
  createRoom,
);
router.get('/getrooms', getAllRooms);
router.get('/:roomNumber', getRoomByNumber);
router.put('/checkin/:roomNumber', isAuthenticated, isAdmin, checkInRoom);
router.put('/checkout/:roomNumber', isAuthenticated, isAdmin, checkOutRoom);
router.delete('/delete/:roomId', isAuthenticated, isAdmin, deleteRoom);
router.put(
  '/update/:roomId',
  isAuthenticated,
  isAdmin,
  multipleUpload,
  updateRoom,
);
router.delete(
  '/deletephoto/:roomId',
  isAuthenticated,
  isAdmin,
  deleteRoomPhoto,
);

export default router;
