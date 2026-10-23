// @ts-nocheck
import Table from "../models/table.model";

export const getBillDetails = async (req, res) => {
  try {
    const { tableNumber } = req.params;

    // Step 1: Find the table
    const table = await Table.findOne({ tableNumber }).populate("currentOrderId");
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // Step 2: Get the current order
    const order = table.currentOrderId;
    if (!order) {
      return res.status(400).json({ message: "No active order for this table" });
    }

    if (order.status !== "completed") {
      return res.status(400).json({ message: "Order not completed yet" });
    }

    // Step 3: Generate bill details
    const bill = {
      billId: order._id,
      customerName: order.customerName || "Guest",
      tableNumber: order.tableNumber,
      orderType: order.orderType,
      paymentMethod: order.paymentMethod,
      orderedAt: order.createdAt,
      completedAt: order.updatedAt,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })),
      subtotal: order.subtotal,
      tax: (order.subtotal * 0.13).toFixed(2), // e.g., 13% tax
      totalAmount: (order.subtotal * 1.13).toFixed(2),
    };

    res.status(200).json(bill);

  } catch (error) {
    console.error("Error generating bill:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
