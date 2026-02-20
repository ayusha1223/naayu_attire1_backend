import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.route.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Static uploads
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
app.use("/api/admin", adminRoutes);

// Routes
app.use("/api/v1/students", authRoutes);
app.use("/api/v1/orders", orderRoutes);      // ✅ Added
app.use("/api/v1/payments", paymentRoutes);  // ✅ Added

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API Running Successfully 🚀" });
});

export default app;
