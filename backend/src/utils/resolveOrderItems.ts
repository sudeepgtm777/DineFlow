import mongoose from 'mongoose';
import MenuItem from '../models/menuItem.model';

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const isMongoId = (value) =>
  typeof value === 'string' &&
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === value;

const resolveOrderItems = async (rawItems = []) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new HttpError('No order items', 400);
  }

  const resolved = [];

  for (const item of rawItems) {
    const menuId = String(item._id || item.menuItemId || item.id || '');
    if (!isMongoId(menuId)) {
      throw new HttpError('Menu item not found', 400);
    }

    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new HttpError('Item quantity must be a positive number', 400);
    }

    const menuItem = await MenuItem.findById(menuId);
    if (!menuItem) {
      throw new HttpError(`Menu item not found: ${menuId}`, 400);
    }
    if (menuItem.status && menuItem.status !== 'available') {
      throw new HttpError(`${menuItem.name} is unavailable`, 400);
    }

    resolved.push({
      name: menuItem.name,
      quantity,
      price: menuItem.price,
      specialInstructions: item.specialInstructions || '',
    });
  }

  return resolved;
};

export default resolveOrderItems;
