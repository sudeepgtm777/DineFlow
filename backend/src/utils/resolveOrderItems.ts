import MenuItem from '../models/menuItem.model';

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const resolveOrderItems = async (rawItems = []) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new HttpError('No order items', 400);
  }

  const resolved = [];

  for (const item of rawItems) {
    const menuId = item.id || item._id || item.menuItemId;
    if (!menuId) {
      throw new HttpError('Each item must include a menu item id', 400);
    }

    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new HttpError('Item quantity must be a positive number', 400);
    }

    const menuItem = await MenuItem.findById(menuId);
    if (!menuItem) {
      throw new HttpError(`Menu item not found: ${menuId}`, 400);
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
