import Table from "../models/table.model";
import {
  getSessionOrders,
  getTableSessionId,
} from "../utils/tableSession";

export const getBillDetails = async (req, res) => {
  try {
    const { tableNumber } = req.params;

    const table = await Table.findOne({ tableNumber: String(tableNumber) });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const sessionId = await getTableSessionId(table);
    const orders = await getSessionOrders(tableNumber, sessionId);

    if (!orders.length) {
      return res.status(400).json({ message: "No open session bill for this table" });
    }

    const items = orders.flatMap((order) =>
      order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })),
    );
    const subtotal = orders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (itemSum, item) => itemSum + item.price * item.quantity,
          0,
        ),
      0,
    );
    const primary = orders[orders.length - 1];

    const bill = {
      billId: primary._id,
      customerName: primary.customerName || "Guest",
      tableNumber: primary.tableNumber,
      orderType: primary.orderType,
      paymentMethod: primary.paymentMethod,
      orderedAt: orders[0].createdAt,
      completedAt: primary.updatedAt || primary.createdAt,
      items,
      subtotal,
      tax: 0,
      totalAmount: subtotal,
      orders,
    };

    res.status(200).json(bill);
  } catch (error) {
    console.error("Error generating bill:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
