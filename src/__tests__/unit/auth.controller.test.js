import { jest } from "@jest/globals";

/* ---------------- MOCK DEPENDENCIES ---------------- */

const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule("../../models/user.model.js", () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreate
  }
}));

const mockHash = jest.fn();
const mockCompare = jest.fn();

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    hash: mockHash,
    compare: mockCompare
  }
}));

const mockSign = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: mockSign
  }
}));

/* ---------------- IMPORT CONTROLLER AFTER MOCKS ---------------- */

const { registerUser, loginUser } =
  await import("../../controllers/auth.controller.js");

/* ---------------- TESTS ---------------- */

describe("Auth Controller Unit Tests", () => {

  let req;
  let res;

  beforeEach(() => {

    req = { body: {} };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();

  });

  /* ================= REGISTER ================= */

  describe("registerUser", () => {

    it("should register a new user successfully", async () => {

      req.body = {
        name: "Ayusha",
        email: "test@test.com",
        password: "123456"
      };

      mockFindOne.mockResolvedValue(null);

      mockHash.mockResolvedValue("hashedpassword");

      mockCreate.mockResolvedValue({
        _id: "user123",
        name: "Ayusha",
        email: "test@test.com"
      });

      await registerUser(req, res);

      expect(mockFindOne).toHaveBeenCalledWith({ email: "test@test.com" });

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User registered successfully",
        data: {
          id: "user123",
          name: "Ayusha",
          email: "test@test.com"
        }
      });

    });


    it("should return error if email already exists", async () => {

      req.body = {
        name: "Ayusha",
        email: "test@test.com",
        password: "123456"
      };

      mockFindOne.mockResolvedValue({ email: "test@test.com" });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email already exists"
      });

    });

  });


  /* ================= LOGIN ================= */

  describe("loginUser", () => {

    it("should login successfully with valid credentials", async () => {

      req.body = {
        email: "test@test.com",
        password: "123456"
      };

      mockFindOne.mockResolvedValue({
        _id: "user123",
        name: "Ayusha",
        email: "test@test.com",
        password: "hashedpassword",
        role: "user"
      });

      mockCompare.mockResolvedValue(true);

      mockSign.mockReturnValue("mockedtoken");

      await loginUser(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: "user123",
          name: "Ayusha",
          email: "test@test.com",
          role: "user",
          token: "mockedtoken"
        }
      });

    });


    it("should return error if user not found", async () => {

      req.body = {
        email: "test@test.com",
        password: "123456"
      };

      mockFindOne.mockResolvedValue(null);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid email or password"
      });

    });


    it("should return error if password incorrect", async () => {

      req.body = {
        email: "test@test.com",
        password: "wrongpass"
      };

      mockFindOne.mockResolvedValue({
        password: "hashedpassword"
      });

      mockCompare.mockResolvedValue(false);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid email or password"
      });

    });

  });

});