import Order from "../models/order.model.js";

/// ===============================
/// 🛒 CREATE ORDER
/// ===============================
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod } = req.body;

    const order = await Order.create({
      userId: req.user._id, // ✅ FIXED
      items,
      totalAmount,
      paymentStatus: paymentMethod === "cod" ? "paid" : "pending",
    });

    res.status(201).json(order);

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
      .populate("userId", "name email") // ✅ FIXED
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
};