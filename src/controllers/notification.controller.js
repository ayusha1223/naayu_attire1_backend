import Notification from "../models/notification.model.js";

/// ===============================
///  GET USER NOTIFICATIONS
/// ===============================
export const getUserNotifications = async (req, res) => {
  try {
    console.log("FETCHING NOTIFICATIONS FOR USER:", req.user._id.toString());
    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    console.log("NOTIFICATIONS FOUND:", notifications.length); // 👈 ADD

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/// ===============================
///  MARK AS READ
/// ===============================
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};