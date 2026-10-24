import Table from "../models/table.model";
import Order from "../models/order.model";

export const getBillDetails = async (req, res) => {
  try {
    const { tableNumber } = req.params;

    const table = await Table.findOne({ tableNumber }).populate("currentOrderId");
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    let orders = [];
    const currentOrder = table.currentOrderId as any;

    if (currentOrder && currentOrder.status === "completed") {
      orders = await Order.find({
        tableNumber: String(tableNumber),
        orderType: "dine-in",
        bookingSessionId: currentOrder.bookingSessionId,
        status: "completed",
      }).sort({ createdAt: 1 });
    } else {
      const latestCompleted = await Order.findOne({
        tableNumber: String(tableNumber),
        orderType: "dine-in",
        status: "completed",
      }).sort({ updatedAt: -1, createdAt: -1 });

      if (!latestCompleted) {
        return res.status(400).json({ message: "No completed order for this table" });
      }

      orders = await Order.find({
        tableNumber: String(tableNumber),
        orderType: "dine-in",
        bookingSessionId: latestCompleted.bookingSessionId,
        status: "completed",
      }).sort({ createdAt: 1 });
    }

    if (!orders.length) {
      return res.status(400).json({ message: "No completed order for this table" });
    }

    const items = orders.flatMap((order) =>
      order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })),
    );
    const subtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);
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
      tax: (subtotal * 0.13).toFixed(2),
      totalAmount: (subtotal * 1.13).toFixed(2),
    };

    res.status(200).json(bill);
  } catch (error) {
    console.error("Error generating bill:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
