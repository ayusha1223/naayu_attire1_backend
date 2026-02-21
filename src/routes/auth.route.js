import express from "express";
import {
  registerUser,
  loginUser,
  uploadUserImage,
  updateProfile,
} from "../controllers/auth.controller.js";

import upload from "../config/multer.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Upload Profile Image
router.post(
  "/upload-image",
  authMiddleware,
  upload.single("image"),
  uploadUserImage
);
// Update Profile
router.put("/update-profile", authMiddleware, updateProfile);

export default router;