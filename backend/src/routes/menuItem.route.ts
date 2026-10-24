import express from 'express';
import { singleUpload } from '../middlewares/multer';
import {
  addMenuItem,
  deleteMenuItem,
  getMenuItemById,
  updateMenuItem,
  getAllMenuItems,
  getMenuCategories,
  getMenuItemCount,
} from '../controllers/menuItem.controller';
import isAuthenticated from '../middlewares/isAuthenticated';
import isAdmin from '../middlewares/isAdmin';

const router = express.Router();

router.post(
  '/add-menu-item',
  isAuthenticated,
  isAdmin,
  singleUpload,
  addMenuItem,
);
router.get('/menu-items', getAllMenuItems);
router.get('/menu-item/:id', getMenuItemById);
router.get('/menu-categories', getMenuCategories);
router.get('/menu-item-count', getMenuItemCount);
router.put(
  '/update-menu-item/:id',
  isAuthenticated,
  isAdmin,
  singleUpload,
  updateMenuItem,
);
router.delete(
  '/delete-menu-item/:id',
  isAuthenticated,
  isAdmin,
  deleteMenuItem,
);

export default router;
