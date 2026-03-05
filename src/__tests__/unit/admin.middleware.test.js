import { jest } from "@jest/globals";
import { adminMiddleware } from "../../middleware/admin.middleware.js";

describe("Admin Middleware Tests", () => {

  let req;
  let res;
  let next;

  beforeEach(() => {

    req = { user: {} };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();

  });

  /* ================= ADMIN ACCESS ================= */

  it("should allow admin user", () => {

    req.user = {
      _id: "user123",
      role: "admin"
    };

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();

  });

  /* ================= NON ADMIN ================= */

  it("should block non-admin user", () => {

    req.user = {
      _id: "user123",
      role: "user"
    };

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      message: "Access denied. Admin only."
    });

  });

  /* ================= NO USER ================= */

  it("should block request if user not present", () => {

    req.user = null;

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      message: "Access denied. Admin only."
    });

  });

});