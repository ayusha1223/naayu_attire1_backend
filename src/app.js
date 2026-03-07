import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.route.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import esewaRoutes from "./routes/esewa-payment.route.js";
import notificationRoutes from "./routes/notification.routes.js";
import productRoutes from "./routes/product.routes.js";
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
app.use("/api/esewa", esewaRoutes);

// Routes
app.use("/api/v1/students", authRoutes);
app.use("/api/v1/orders", orderRoutes);      
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/notifications", notificationRoutes);  
app.use("/api/v1/products", productRoutes);


app.get("/", (req, res) => {
  res.json({ message: "API Running Successfully 🚀" });
});

export default app;
