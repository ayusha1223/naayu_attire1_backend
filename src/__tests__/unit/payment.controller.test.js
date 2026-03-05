import { jest } from "@jest/globals";

/* ---------------- MOCK MODELS ---------------- */

const mockOrderFindById = jest.fn();
const mockPaymentCreate = jest.fn();
const mockSave = jest.fn();

jest.unstable_mockModule("../../models/order.model.js", () => ({
  default: {
    findById: mockOrderFindById
  }
}));

jest.unstable_mockModule("../../models/payment.model.js", () => ({
  default: {
    create: mockPaymentCreate
  }
}));

/* ---------------- IMPORT CONTROLLER ---------------- */

const { processPayment } =
  await import("../../controllers/payment.controller.js");

/* ---------------- TESTS ---------------- */

describe("Payment Controller Unit Tests", () => {

  let req;
  let res;

  beforeEach(() => {

    req = {
      body: {},
      user: { _id: "user123" }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();

  });

  /* ================= PAYMENT SUCCESS ================= */

  it("should process payment successfully", async () => {

    req.body = {
      orderId: "order123",
      paymentMethod: "esewa",
      transactionId: "txn123"
    };

    const order = {
      _id: "order123",
      totalAmount: 1000,
      paymentStatus: "pending",
      save: mockSave
    };

    mockOrderFindById.mockResolvedValue(order);

    mockPaymentCreate.mockResolvedValue({
      id: "payment123",
      amount: 1000
    });

    await processPayment(req, res);

    expect(mockPaymentCreate).toHaveBeenCalled();

    expect(order.paymentStatus).toBe("paid");

    expect(mockSave).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);

  });


  /* ================= ORDER NOT FOUND ================= */

  it("should return 404 if order not found", async () => {

    req.body = {
      orderId: "order123"
    };

    mockOrderFindById.mockResolvedValue(null);

    await processPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      message: "Order not found"
    });

  });


  /* ================= ALREADY PAID ================= */

  it("should return error if order already paid", async () => {

    req.body = {
      orderId: "order123"
    };

    const order = {
      paymentStatus: "paid"
    };

    mockOrderFindById.mockResolvedValue(order);

    await processPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Already paid"
    });

  });

});