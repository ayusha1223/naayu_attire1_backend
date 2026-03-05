import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

jest.spyOn(console, "error").mockImplementation(() => {});

jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: async () => true
    })
  }
}));

const { default: app } = await import("../../app.js");
const { default: User } = await import("../../models/user.model.js");

let mongoServer;

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

afterEach(async () => {
  await User.deleteMany();
});

describe("Auth Integration Tests", () => {

  it("should register a new user", async () => {

    const res = await request(app)
      .post("/api/v1/students/register")
      .send({
        name: "Ayusha",
        email: "test@test.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

  });

  it("should login successfully", async () => {

    await request(app)
      .post("/api/v1/students/register")
      .send({
        name: "Ayusha",
        email: "test@test.com",
        password: "123456"
      });

    const res = await request(app)
      .post("/api/v1/students/login")
      .send({
        email: "test@test.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();

  });

  it("should send OTP for password reset", async () => {

    await request(app)
      .post("/api/v1/students/register")
      .send({
        name: "Ayusha",
        email: "test@test.com",
        password: "123456"
      });

    const res = await request(app)
      .post("/api/v1/students/forgot-password")
      .send({
        email: "test@test.com"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

  });

  it("should verify OTP", async () => {

    await User.create({
      name: "Ayusha",
      email: "test@test.com",
      password: "123456",
      resetOtp: "123456",
      resetOtpExpiry: Date.now() + 100000
    });

    const res = await request(app)
      .post("/api/v1/students/verify-otp")
      .send({
        email: "test@test.com",
        otp: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

  });

  it("should reset password", async () => {

    await User.create({
      name: "Ayusha",
      email: "test@test.com",
      password: "123456"
    });

    const res = await request(app)
      .post("/api/v1/students/reset-password")
      .send({
        email: "test@test.com",
        newPassword: "newpassword"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

  });

  it("should update user profile", async () => {

    const user = await User.create({
      name: "Ayusha",
      email: "test@test.com",
      password: "123456",
      role: "user"
    });

    const token = jwt.sign(
      { id: user._id, role: "user" },
      "testsecret"
    );

    const res = await request(app)
      .put("/api/v1/students/update-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Name",
        phone: "9800000000"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

  });

});