import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my", protect, getUserNotifications);
router.put("/read/:id", protect, markNotificationAsRead);

export default router;