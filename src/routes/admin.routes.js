import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllOrders,
  getAllPayments,
  getAdminProfile   // ✅ ADD THIS
} from "../controllers/admin.controller.js";
import { getMonthlyRevenue } from "../controllers/admin.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();

// 🔐 Protect all admin routes
router.use(authMiddleware, adminMiddleware);
router.get("/monthly-revenue", getMonthlyRevenue);

// 📊 Dashboard
router.get("/dashboard", getDashboardStats);
router.get("/profile", getAdminProfile);  // ✅ ADD THIS

// 👥 Users
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// 📦 Orders
router.get("/orders", getAllOrders);

// 💳 Payments
router.get("/payments", getAllPayments);

export default router;