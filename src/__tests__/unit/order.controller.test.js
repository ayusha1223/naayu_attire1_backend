import { jest } from "@jest/globals";

/* ---------------- MOCK MODELS ---------------- */

const mockCreate = jest.fn();
const mockFindById = jest.fn();
const mockFind = jest.fn();
const mockSave = jest.fn();

jest.unstable_mockModule("../../models/order.model.js", () => ({
  default: {
    create: mockCreate,
    findById: mockFindById,
    find: mockFind
  }
}));

const mockNotificationCreate = jest.fn();

jest.unstable_mockModule("../../models/notification.model.js", () => ({
  default: {
    create: mockNotificationCreate
  }
}));

const mockSendEmail = jest.fn();

jest.unstable_mockModule("../../utils/sendEmail.js", () => ({
  sendEmail: mockSendEmail
}));

/* ---------------- IMPORT CONTROLLER ---------------- */

const {
  createOrder,
  updateOrderStatus,
  cancelOrder,
  refundOrder
} = await import("../../controllers/order.controller.js");

/* ---------------- TESTS ---------------- */

describe("Order Controller Unit Tests", () => {

  let req;
  let res;

  beforeEach(() => {

    req = {
      body: {},
      params: {},
      user: { _id: "user123" }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();

  });

  /* ================= CREATE ORDER ================= */

  describe("createOrder", () => {

    it("should create order successfully", async () => {

      req.body = {
        items: [{ productId: "p1", name: "Shirt", price: 1000, quantity: 1 }],
        totalAmount: 1000,
        paymentMethod: "cod",
        customerName: "Ayusha",
        email: "test@test.com",
        phone: "123456",
        address: "Kathmandu",
        city: "Kathmandu",
        postalCode: "44600"
      };

      mockCreate.mockResolvedValue({ orderId: "order123" });

      await createOrder(req, res);

      expect(mockCreate).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(201);

    });

    it("should return error if no items", async () => {

      req.body = {
        items: [],
        paymentMethod: "cod"
      };

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message: "No items in order"
      });

    });

  });

  /* ================= UPDATE STATUS ================= */

  describe("updateOrderStatus", () => {

    it("should update order status successfully", async () => {

      req.params.id = "order123";
      req.body.status = "shipped";

      const order = {
        _id: "order123",
        userId: "user123",
        email: "test@test.com",
        customerName: "Ayusha",
        orderStatus: "processing",
        save: mockSave
      };

      mockFindById.mockResolvedValue(order);

      await updateOrderStatus(req, res);

      expect(mockSave).toHaveBeenCalled();

      expect(mockNotificationCreate).toHaveBeenCalled();

      expect(mockSendEmail).toHaveBeenCalled();

    });

  });

  /* ================= CANCEL ORDER ================= */

  describe("cancelOrder", () => {

    it("should submit refund request", async () => {

      req.params.id = "order123";

      const order = {
        userId: "user123",
        orderStatus: "processing",
        refundRequested: false,
        save: mockSave
      };

      mockFindById.mockResolvedValue(order);

      await cancelOrder(req, res);

      expect(order.refundRequested).toBe(true);

      expect(mockSave).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith({
        message: "Refund request submitted",
        order
      });

    });

  });

  /* ================= REFUND ORDER ================= */

  describe("refundOrder", () => {

    it("should process refund", async () => {

      req.params.id = "order123";

      const order = {
        _id: "order123",
        userId: "user123",
        email: "test@test.com",
        customerName: "Ayusha",
        totalAmount: 1000,
        paymentStatus: "paid",
        orderStatus: "processing",
        refundRequested: true,
        save: mockSave
      };

      mockFindById.mockResolvedValue(order);

      await refundOrder(req, res);

      expect(order.paymentStatus).toBe("refunded");

      expect(order.orderStatus).toBe("cancelled");

      expect(mockSave).toHaveBeenCalled();

      expect(mockNotificationCreate).toHaveBeenCalled();

      expect(mockSendEmail).toHaveBeenCalled();

    });

  });

});