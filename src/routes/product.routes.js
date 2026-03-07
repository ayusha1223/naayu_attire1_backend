import express from "express";
import {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import upload from "../config/multer.js";

const router = express.Router();

// Create product WITH IMAGE
router.post("/", upload.single("image"), createProduct);

// Get products
router.get("/", getProducts);

router.delete("/:id", deleteProduct);
router.put("/:id", updateProduct);

export default router;