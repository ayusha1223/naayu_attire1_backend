import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

import {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllOrders,
  getAllPayments,
  getAdminProfile,
  getMonthlyRevenue,
} from "../controllers/admin.controller.js";

import {
  updateOrderStatus,
  refundOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

// 🔐 Protect all admin routes
router.use(authMiddleware, adminMiddleware);

// 📈 Revenue
router.get("/monthly-revenue", getMonthlyRevenue);

// 📊 Dashboard + Profile
router.get("/dashboard", getDashboardStats);
router.get("/profile", getAdminProfile);

// 👥 Users
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// 📦 Orders
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.put("/orders/:id/refund", refundOrder);

// 💳 Payments
router.get("/payments", getAllPayments);

export default router;