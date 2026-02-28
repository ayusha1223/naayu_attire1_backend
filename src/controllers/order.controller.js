import Order from "../models/order.model.js";
import Notification from "../models/notification.model.js";
import { sendEmail } from "../utils/sendEmail.js";
/// ===============================
/// 🛒 CREATE ORDER
/// ===============================
export const createOrder = async (req, res) => {
  try {
   const {
  items,
  totalAmount,
  paymentMethod,
  customerName,
  email,
  phone,
  address,
  city,
  postalCode,
} = req.body;

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

  customerName,
  email,
  phone,
  address,
  city,
  postalCode,

  items: formattedItems,
  totalAmount,
  paymentMethod,
  paymentStatus: paymentMethod === "cod" ? "paid" : "pending",
  orderStatus: "processing",
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
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "cancelled")
      return res.status(400).json({ message: "Cancelled order cannot be updated" });

    if (order.orderStatus === "delivered")
      return res.status(400).json({ message: "Delivered order cannot be updated" });

    order.orderStatus = status;
    await order.save();

    // 🔔 Status message
    const messageMap = {
      processing: "Your order is being processed.",
      shipped: "Your order has been shipped 🚚",
      delivered: "Your order has been delivered 🎉",
      cancelled: "Your order has been cancelled ❌",
    };

    const message = messageMap[status];

   console.log("ADMIN UPDATING ORDER");
console.log("ORDER USER ID:", order.userId.toString());
console.log("ADMIN USER ID:", req.user._id.toString());

    // 🔔 Save notification
    await Notification.create({
      userId: order.userId,
      orderId: order._id,
      message,
    });

    // 📧 Send email
    await sendEmail(
      order.email,
      "Order Status Updated",
      `Hi ${order.customerName},\n\n${message}\n\nOrder ID: ${order._id}\n\nThank you for shopping with Naayu Attire ❤️`
    );

    res.json({ message: "Order status updated", order });

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
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
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Must be requested first
    if (order.refundRequested !== true) {
      return res.status(400).json({
        message: "No refund request found",
      });
    }

    // ✅ Must be paid
    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Only PAID orders can be refunded",
      });
    }

    // ✅ Process refund
    order.paymentStatus = "refunded";
    order.orderStatus = "cancelled";
    order.refundRequested = false;

    await order.save();

    // 🔔 Create notification
    const notificationMessage =
      "Your refund has been approved and processed 💸";

    await Notification.create({
      userId: order.userId,
      orderId: order._id,
      message: notificationMessage,
    });

    // 📧 Send email
    await sendEmail(
      order.email,
      "Refund Processed Successfully",
      `Hi ${order.customerName},

Your refund for Order ID ${order._id} has been successfully processed.

Refund Amount: Rs. ${order.totalAmount}

We’re sorry for the inconvenience.
Thank you for shopping with Naayu Attire ❤️`
    );

    res.json({
      message: "Refund approved and processed",
      order,
    });

  } catch (error) {
    console.error("REFUND ERROR:", error);
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


/// ===============================
/// 📄 GET ORDER BY ID
/// ===============================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

