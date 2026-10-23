// @ts-nocheck
import express from "express";
import { singleUpload } from "../middlewares/mutler";
import {
  addMenuItem,
  deleteMenuItem,
  getMenuItemById,
  updateMenuItem,
  getAllMenuItems,
  getMenuCategories,
  getMenuItemCount,
} from "../controllers/menuItem.controller";
import isAuthenticated from "../middlewares/isAuthenticated";
const router = express.Router();
router.post("/add-menu-item", singleUpload, isAuthenticated, addMenuItem);
router.get("/menu-items", getAllMenuItems);
router.get("/menu-item/:id", getMenuItemById);
router.get("/menu-categories", getMenuCategories);
router.get("/menu-item-count", getMenuItemCount);
router.put(
  "/update-menu-item/:id",
  isAuthenticated,
  singleUpload,
  updateMenuItem
);
router.delete("/delete-menu-item/:id", isAuthenticated, deleteMenuItem);

export default router;
