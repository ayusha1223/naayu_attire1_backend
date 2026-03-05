import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../../app.js";
import Order from "../../models/order.model.js";

let mongoServer;
let token;
let orderId;

beforeAll(async () => {

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  /// REGISTER USER
  await request(app)
    .post("/api/v1/students/register")
    .send({
      name: "Payment User",
      email: "payment@test.com",
      password: "123456"
    });

  /// LOGIN USER
  const loginRes = await request(app)
    .post("/api/v1/students/login")
    .send({
      email: "payment@test.com",
      password: "123456"
    });

  const jwtToken =
    loginRes.body.token ||
    loginRes.body.data?.token ||
    loginRes.body.accessToken;

  token = `Bearer ${jwtToken}`;

  /// CREATE ORDER (needed for payment)
  const orderRes = await request(app)
    .post("/api/v1/orders")
    .set("Authorization", token)
    .send({
      items: [
        {
          productId: "123",
          name: "Kurtha",
          price: 2000,
          quantity: 1,
          image: "test.jpg"
        }
      ],
      totalAmount: 2000,
      paymentMethod: "esewa",
      customerName: "Ayusha",
      email: "ayusha@test.com",
      phone: "9800000000",
      address: "Kathmandu",
      city: "Kathmandu",
      postalCode: "44600"
    });

  orderId = orderRes.body._id;

});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Payment Integration Tests", () => {

  /// PROCESS PAYMENT
  test("Process Payment Successfully", async () => {

    const res = await request(app)
      .post("/api/v1/payments")
      .set("Authorization", token)
      .send({
        orderId,
        paymentMethod: "esewa",
        transactionId: "TXN123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Payment successful");

  });

  /// PAYMENT SHOULD FAIL IF ALREADY PAID
  test("Prevent duplicate payment", async () => {

    const res = await request(app)
      .post("/api/v1/payments")
      .set("Authorization", token)
      .send({
        orderId,
        paymentMethod: "esewa",
        transactionId: "TXN999"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Already paid");

  });

});