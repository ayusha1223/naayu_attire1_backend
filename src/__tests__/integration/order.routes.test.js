import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app.js";

let mongoServer;
let token;
let orderId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Register user
  await request(app)
    .post("/api/v1/students/register")
    .send({
      name: "Test User",
      email: "test@test.com",
      password: "123456"
    });

  // Login user
  const loginRes = await request(app)
    .post("/api/v1/students/login")
    .send({
      email: "test@test.com",
      password: "123456"
    });

  // DEBUG to see token structure
  console.log("LOGIN RESPONSE:", loginRes.body);

  // handle both common structures
  const jwtToken =
    loginRes.body.token ||
    loginRes.body.data?.token ||
    loginRes.body.accessToken;

  token = `Bearer ${jwtToken}`;
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Order Integration Tests", () => {

  test("Create Order", async () => {

    const res = await request(app)
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
        paymentMethod: "cod",
        customerName: "Ayusha",
        email: "ayusha@test.com",
        phone: "9800000000",
        address: "Kathmandu",
        city: "Kathmandu",
        postalCode: "44600"
      });

    expect(res.statusCode).toBe(201);

    orderId = res.body._id;
  });

  test("Get User Orders", async () => {

    const res = await request(app)
      .get("/api/v1/orders")
      .set("Authorization", token);

    expect(res.statusCode).toBe(200);
  });

  test("Cancel Order", async () => {

    const res = await request(app)
      .put(`/api/v1/orders/${orderId}/cancel`)
      .set("Authorization", token);

    expect(res.statusCode).toBe(200);
  });

});