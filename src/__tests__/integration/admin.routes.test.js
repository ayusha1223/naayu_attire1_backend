import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

const { default: app } = await import("../../app.js");
const { default: User } = await import("../../models/user.model.js");
const { default: Order } = await import("../../models/order.model.js");
const { default: Payment } = await import("../../models/payment.model.js");

let mongoServer;
let adminToken;
let adminUser;

beforeAll(async () => {

  process.env.JWT_SECRET = "testsecret";

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

});

afterAll(async () => {

  await mongoose.disconnect();
  await mongoServer.stop();

});

beforeEach(async () => {

  await User.deleteMany();
  await Order.deleteMany();
  await Payment.deleteMany();

  adminUser = await User.create({
    name: "Admin",
    email: "admin@test.com",
    password: "123456",
    role: "admin"
  });

  adminToken = jwt.sign(
    { id: adminUser._id, role: "admin" },
    "testsecret"
  );

});

describe("Admin Routes Integration Tests", () => {

  /* ================= DASHBOARD ================= */

  it("should return dashboard stats", async () => {

    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.body).toHaveProperty("totalUsers");

  });

  /* ================= CREATE USER ================= */

  it("should create user", async () => {

    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test User",
        email: "test@test.com",
        password: "123456",
        role: "user"
      });

    expect(res.statusCode).toBe(201);

    expect(res.body.email).toBe("test@test.com");

  });

  /* ================= GET USERS ================= */

  it("should return all users", async () => {

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);

    expect(Array.isArray(res.body)).toBe(true);

  });

  /* ================= DELETE USER ================= */

  it("should delete a user", async () => {

    const user = await User.create({
      name: "Delete Me",
      email: "delete@test.com",
      password: "123456"
    });

    const res = await request(app)
      .delete(`/api/admin/users/${user._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.message).toBe("User deleted successfully");

  });

  /* ================= GET ADMIN PROFILE ================= */

  it("should return admin profile", async () => {

    const res = await request(app)
      .get("/api/admin/profile")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.email).toBe("admin@test.com");

  });

  /* ================= GET PAYMENTS ================= */

  it("should return payments list", async () => {

  const order = await Order.create({
  userId: adminUser._id,

  customerName: "Admin User",
  email: "admin@test.com",
  phone: "9800000000",
  address: "Kathmandu",

  items: [
    {
      productId: new mongoose.Types.ObjectId(),
      name: "Test Product",
      price: 500,
      quantity: 1,
      image: "test.jpg"
    }
  ],

  totalAmount: 500,
  paymentMethod: "cod",
  paymentStatus: "paid",
  orderStatus: "processing"
});

await Payment.create({
  userId: adminUser._id,
  orderId: order._id,
  amount: 500,
  paymentMethod: "cod",
  transactionId: "txn123",
  status: "success"
});

    const res = await request(app)
      .get("/api/admin/payments")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);

    expect(Array.isArray(res.body)).toBe(true);

  });

});