import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import studentRoutes from "./routes/student.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/students", studentRoutes);

export default app;
