import express from "express";
import Order from "../models/order.model.js"; // 👈 ADD THIS

import {
  createOrder,
  getAllOrders
} from "../controllers/order.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();

// Create order
router.post("/", authMiddleware, createOrder);

// Get logged-in user's orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id   // make sure this matches your middleware
    }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin get all orders
router.get("/admin", authMiddleware, adminMiddleware, getAllOrders);

export default router;