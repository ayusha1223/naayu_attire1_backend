import { jest } from "@jest/globals";

/* ---------------- MOCK DATABASE MODELS ---------------- */

const mockUserCount = jest.fn();
const mockOrderCount = jest.fn();
const mockPaymentCount = jest.fn();
const mockAggregate = jest.fn();
const mockFind = jest.fn();
const mockCreate = jest.fn();
const mockDelete = jest.fn();

jest.unstable_mockModule("../../models/user.model.js", () => ({
  default: {
    countDocuments: mockUserCount,
    find: mockFind,
    create: mockCreate,
    findByIdAndDelete: mockDelete
  }
}));

jest.unstable_mockModule("../../models/order.model.js", () => ({
  default: {
    countDocuments: mockOrderCount,
    find: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn()
      })
    })
  }
}));

jest.unstable_mockModule("../../models/payment.model.js", () => ({
  default: {
    countDocuments: mockPaymentCount,
    aggregate: mockAggregate,
    find: jest.fn()
  }
}));

const mockHash = jest.fn();

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    hash: mockHash
  }
}));

/* ---------------- IMPORT CONTROLLER ---------------- */

const {
  getDashboardStats,
  createUser,
  deleteUser,
  getMonthlyRevenue
} = await import("../../controllers/admin.controller.js");

/* ---------------- TESTS ---------------- */

describe("Admin Controller Unit Tests", () => {

  let req;
  let res;

  beforeEach(() => {

    req = { body: {}, params: {}, user: {} };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  /* ================= DASHBOARD ================= */

  describe("getDashboardStats", () => {

    it("should return dashboard statistics", async () => {

      mockUserCount.mockResolvedValue(10);
      mockOrderCount.mockResolvedValue(20);
      mockPaymentCount.mockResolvedValue(15);

      mockAggregate.mockResolvedValue([{ total: 5000 }]);

      await getDashboardStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        totalUsers: 10,
        totalOrders: 20,
        totalPayments: 15,
        totalRevenue: 5000
      });

    });

  });


  /* ================= CREATE USER ================= */

  describe("createUser", () => {

    it("should create a new user", async () => {

      req.body = {
        name: "Ayusha",
        email: "test@test.com",
        password: "123456",
        role: "admin"
      };

      mockHash.mockResolvedValue("hashedpassword");

      mockCreate.mockResolvedValue({
        name: "Ayusha",
        email: "test@test.com",
        role: "admin"
      });

      await createUser(req, res);

      expect(mockCreate).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(201);

    });

  });


  /* ================= DELETE USER ================= */

  describe("deleteUser", () => {

    it("should delete a user successfully", async () => {

      req.params.id = "user123";

      mockDelete.mockResolvedValue({});

      await deleteUser(req, res);

      expect(mockDelete).toHaveBeenCalledWith("user123");

      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully"
      });

    });

  });


  /* ================= MONTHLY REVENUE ================= */

  describe("getMonthlyRevenue", () => {

    it("should return formatted monthly revenue", async () => {

      mockAggregate.mockResolvedValue([
        { _id: 1, total: 1000 },
        { _id: 2, total: 2000 }
      ]);

      await getMonthlyRevenue(req, res);

      expect(res.json).toHaveBeenCalledWith([
        { month: "Jan", revenue: 1000 },
        { month: "Feb", revenue: 2000 }
      ]);

    });

  });

});