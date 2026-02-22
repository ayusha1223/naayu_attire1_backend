import express from "express";
import Order from "../models/order.model.js";

import {
  createOrder,
  getAllOrders,
  cancelOrder,
} from "../controllers/order.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();

// ✅ Create order
router.post("/", authMiddleware, createOrder);

// ✅ Cancel order (USER) -> refund request only
router.put("/:id/cancel", authMiddleware, cancelOrder);

// ✅ Get logged-in user's orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Admin get all orders (Optional - you already use /api/admin/orders)
router.get("/admin", authMiddleware, adminMiddleware, getAllOrders);

export default router;