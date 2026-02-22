import Order from "../models/order.model.js";

/// ===============================
/// 🛒 CREATE ORDER
/// ===============================
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: "paymentMethod is required" });
    }

    const formattedItems = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const order = await Order.create({
      userId: req.user._id,
      items: formattedItems,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "paid" : "pending",
      orderStatus: "processing",
      refundRequested: false, // ✅ important
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/// ===============================
/// 🛠 UPDATE ORDER STATUS (ADMIN)
/// ===============================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["processing", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Lock status if already cancelled or delivered
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Cancelled order cannot be updated" });
    }
    if (order.orderStatus === "delivered") {
      return res.status(400).json({ message: "Delivered order cannot be updated" });
    }

    // ✅ If user requested refund, admin should NOT ship/deliver
    if (order.refundRequested === true && (status === "shipped" || status === "delivered")) {
      return res.status(400).json({
        message: "Refund requested. Please refund/cancel before shipping.",
      });
    }

    // ✅ Optional: prevent admin from cancelling directly without refund
    // If you want admin cancel WITHOUT refund, remove this block
    if (status === "cancelled" && order.paymentStatus === "paid" && order.refundRequested !== true) {
      return res.status(400).json({
        message: "Paid order cannot be cancelled directly. Use refund action.",
      });
    }

    order.orderStatus = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/// ===============================
/// ❌ CANCEL ORDER (USER) = REFUND REQUEST
/// ===============================
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Only owner can request refund
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // ✅ Only allow request while processing
    if (order.orderStatus !== "processing") {
      return res.status(400).json({
        message: "Order cannot be cancelled at the moment",
      });
    }

    // ✅ If already requested, don’t duplicate
    if (order.refundRequested === true) {
      return res.status(400).json({ message: "Refund already requested" });
    }

    order.refundRequested = true;
    await order.save();

    res.json({ message: "Refund request submitted", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/// ===============================
/// 💸 REFUND ORDER (ADMIN)
/// ===============================
export const refundOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Must be requested first
    if (order.refundRequested !== true) {
      return res.status(400).json({ message: "No refund request found" });
    }

    // ✅ Must be paid (refund means money back)
    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Only PAID orders can be refunded",
      });
    }

    // ✅ Process refund (demo)
    order.paymentStatus = "refunded";
    order.orderStatus = "cancelled";
    order.refundRequested = false;

    await order.save();

    res.json({ message: "Refund approved and processed", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/// ===============================
/// 📦 GET ALL ORDERS (ADMIN)
/// ===============================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
};