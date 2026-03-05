import { jest } from "@jest/globals";

/* ---------------- MOCK MODEL ---------------- */

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockSave = jest.fn();

jest.unstable_mockModule("../../models/notification.model.js", () => ({
  default: {
    find: mockFind,
    findById: mockFindById
  }
}));

/* ---------------- IMPORT CONTROLLER ---------------- */

const {
  getUserNotifications,
  markNotificationAsRead
} = await import("../../controllers/notification.controller.js");

/* ---------------- TESTS ---------------- */

describe("Notification Controller Unit Tests", () => {

  let req;
  let res;

  beforeEach(() => {

    req = {
      user: { _id: "user123" },
      params: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();

  });

  /* ================= GET NOTIFICATIONS ================= */

  describe("getUserNotifications", () => {

    it("should return user notifications", async () => {

      const notifications = [
        { message: "Order shipped" },
        { message: "Order delivered" }
      ];

      mockFind.mockReturnValue({
        sort: jest.fn().mockResolvedValue(notifications)
      });

      await getUserNotifications(req, res);

      expect(res.json).toHaveBeenCalledWith(notifications);

    });

  });


  /* ================= MARK AS READ ================= */

  describe("markNotificationAsRead", () => {

    it("should mark notification as read", async () => {

      req.params.id = "notif123";

      const notification = {
        isRead: false,
        save: mockSave
      };

      mockFindById.mockResolvedValue(notification);

      await markNotificationAsRead(req, res);

      expect(notification.isRead).toBe(true);

      expect(mockSave).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith({
        message: "Notification marked as read"
      });

    });


    it("should return 404 if notification not found", async () => {

      req.params.id = "notif123";

      mockFindById.mockResolvedValue(null);

      await markNotificationAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        message: "Notification not found"
      });

    });

  });

});