import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";
import fs from "fs";

import app from "../../app.js";

let mongoServer;
let productId;

beforeAll(async () => {

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());


  const testImagePath = path.join(process.cwd(), "test-image.jpg");

  if (!fs.existsSync(testImagePath)) {
    fs.writeFileSync(testImagePath, "fake image");
  }

});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Product Integration Tests", () => {

  /// CREATE PRODUCT
  test("Create product", async () => {

    const res = await request(app)
      .post("/api/v1/products")
      .field("name", "Test Kurtha")
      .field("price", 2000)
      .field("description", "Beautiful kurtha")
      .field("rating", 4)
      .field("color", "red")
      .field("category", "casual")
      .field("isNew", true)
      .attach("image", path.join(process.cwd(), "test-image.jpg"));

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    productId = res.body.data._id;
  });

  /// GET PRODUCTS
  test("Get products", async () => {

    const res = await request(app)
      .get("/api/v1/products");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  /// UPDATE PRODUCT
  test("Update product", async () => {

    const res = await request(app)
      .put(`/api/v1/products/${productId}`)
      .send({
        name: "Updated Kurtha",
        price: 2500,
        description: "Updated description",
        category: "casual",
        color: "red",
        oldPrice: 3000
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  /// DELETE PRODUCT
  test("Delete product", async () => {

    const res = await request(app)
      .delete(`/api/v1/products/${productId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Product deleted");
  });

});