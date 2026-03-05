import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../../app.js";
import Notification from "../../models/notification.model.js";

let mongoServer;
let token;
let userId;
let notificationId;

beforeAll(async () => {

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  /// REGISTER USER
  await request(app)
    .post("/api/v1/students/register")
    .send({
      name: "Test User",
      email: "notify@test.com",
      password: "123456"
    });

  /// LOGIN USER
  const loginRes = await request(app)
    .post("/api/v1/students/login")
    .send({
      email: "notify@test.com",
      password: "123456"
    });

  const jwtToken =
    loginRes.body.token ||
    loginRes.body.data?.token ||
    loginRes.body.accessToken;

  token = `Bearer ${jwtToken}`;

  /// GET USER ID FROM TOKEN
  const user = await mongoose.connection
    .collection("users")
    .findOne({ email: "notify@test.com" });

  userId = user._id;

  /// CREATE TEST NOTIFICATION
  const notification = await Notification.create({
    userId,
    message: "Test notification",
  });

  notificationId = notification._id;

});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Notification Integration Tests", () => {

  /// GET USER NOTIFICATIONS
  test("Get user notifications", async () => {

    const res = await request(app)
      .get("/api/v1/notifications/my")
      .set("Authorization", token);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });


  /// MARK NOTIFICATION AS READ
  test("Mark notification as read", async () => {

    const res = await request(app)
      .put(`/api/v1/notifications/read/${notificationId}`)
      .set("Authorization", token);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Notification marked as read");

  });

});