import express from "express";
import {
  createOrder,
  getAllOrders
} from "../controllers/order.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();

// User create order
router.post("/", authMiddleware, createOrder);

// Admin get all orders
router.get("/admin", authMiddleware, adminMiddleware, getAllOrders);

export default router;