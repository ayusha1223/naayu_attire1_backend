import express from "express";
import {
  registerStudent,
  loginStudent,
} from "../controllers/student.controller.js";
import upload from "../config/multer.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post(
  "/upload-image",
  authMiddleware,
  upload.single("image"),
  uploadStudentImage
);

export default router;
