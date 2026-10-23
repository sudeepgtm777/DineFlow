// @ts-nocheck
import MenuItem from "../models/menuItem.model";
import User from "../models/user.model";
import cloudinary from "../utils/cloudinary";
import getDataUri from "../utils/datauri";

// Function to add a menu item
export const addMenuItem = async (req, res) => {
  try {
    const file = req.file;
    let imageUpload = {};

    if (file) {
      const fileUri = getDataUri(file);

      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: "menuItems",
      });

      imageUpload = {
        url: cloudResponse.secure_url,
        public_id: cloudResponse.public_id,
      };
    }

    let mainImage = imageUpload.url ? imageUpload : req.body.image || {};

    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid user ID. User does not exist." });
    }

    const newMenuItem = new MenuItem({
      name: req.body.name,
      description: req.body.description || "",
      price: req.body.price,
      category: req.body.category,
      image: mainImage,
      status: req.body.status,
      createdBy: userId,  
    });

    const savedMenuItem = await newMenuItem.save();

    res.status(201).json({
      message: "Menu item added successfully",
      menuItem: savedMenuItem,
    });
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find();

    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({ message: "No menu items found." });
    }

    res.status(200).json({
      message: "Menu items retrieved successfully",
      menuItems,
    });
  } catch (error) {
    console.error("Error retrieving menu items:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get menu item by ID
export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id).populate("createdBy", "fullname phoneNumber profile.profilePhoto");

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({
      message: "Menu item retrieved successfully",
      menuItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    let imageUpload = {};

    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: "menuItems",
      });

      imageUpload = {
        url: cloudResponse.secure_url,
        public_id: cloudResponse.public_id,
      };
    }

    let mainImage = imageUpload.url ? imageUpload : req.body.image || {};

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: mainImage,
        status: req.body.status,
      },
      { new: true }
    );

    if (!updatedMenuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({
      message: "Menu item updated successfully",
      menuItem: updatedMenuItem,
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (menuItem.image && menuItem.image.public_id) {
      await cloudinary.uploader.destroy(menuItem.image.public_id);
    }

    await MenuItem.findByIdAndDelete(id);

    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all unique menu categories (including custom)
export const getMenuCategories = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({}, "category customCategory");

    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({ message: "No menu items found." });
    }

    const categoriesSet = new Set();

    menuItems.forEach((item) => {
      if (item.category === "Custom" && item.customCategory) {
        categoriesSet.add(item.customCategory);
      } else {
        categoriesSet.add(item.category);
      }
    });

    const categories = Array.from(categoriesSet);

    res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get total count of menu items
export const getMenuItemCount = async (req, res) => {
  try {
    const count = await MenuItem.countDocuments();
    res.status(200).json({
      message: "Total menu item count retrieved successfully",
      totalCount: count,
    });
  } catch (error) {
    console.error("Error retrieving menu item count:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

