import { jest } from "@jest/globals";

/* ---------------- MOCK DEPENDENCIES ---------------- */

const mockVerify = jest.fn();
const mockFindById = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: mockVerify,
  },
}));

jest.unstable_mockModule("../../models/user.model.js", () => ({
  default: {
    findById: mockFindById,
  },
}));

/* ---------------- IMPORT MIDDLEWARE ---------------- */

const { default: authMiddleware } =
  await import("../../middleware/auth.middleware.js");

/* ---------------- TEST SUITE ---------------- */

describe("Auth Middleware Tests", () => {

  let req;
  let res;
  let next;

  beforeEach(() => {

    req = {
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  /* ================= NO TOKEN ================= */

  it("should return 401 if no token provided", async () => {

    req.headers.authorization = undefined;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "No token provided",
    });

  });

  /* ================= INVALID FORMAT ================= */

  it("should return 401 if token format invalid", async () => {

    req.headers.authorization = "InvalidToken";

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid token format",
    });

  });

  /* ================= USER NOT FOUND ================= */

  it("should return 401 if user not found", async () => {

    req.headers.authorization = "Bearer token123";

    mockVerify.mockReturnValue({ id: "user123" });

    mockFindById.mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });

  });

  /* ================= VALID TOKEN ================= */

  it("should allow request with valid token", async () => {

    req.headers.authorization = "Bearer token123";

    mockVerify.mockReturnValue({ id: "user123" });

    const user = { _id: "user123", role: "user" };

    mockFindById.mockResolvedValue(user);

    await authMiddleware(req, res, next);

    expect(req.user).toEqual(user);

    expect(next).toHaveBeenCalled();

  });

  /* ================= INVALID TOKEN ================= */

  it("should return 401 if token verification fails", async () => {

    req.headers.authorization = "Bearer token123";

    mockVerify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
    });

  });

});