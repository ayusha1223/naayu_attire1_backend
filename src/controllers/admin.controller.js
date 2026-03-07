import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import bcrypt from "bcryptjs";

/// ===============================
//// DASHBOARD STATS
/// ===============================
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalPayments = await Payment.countDocuments();

    const revenueAgg = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalRevenue =
      revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    res.json({
      totalUsers,
      totalOrders,
      totalPayments,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard error", error });
  }
};


/// ===============================
//// GET ALL USERS (WITH STATS)
/// ===============================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const usersWithStats = await Promise.all(
      users.map(async (user) => {

        // Count Orders
        const orderCount = await Order.countDocuments({
          userId: user._id
        });

        //  Get Successful Payments
        const payments = await Payment.find({
          userId: user._id,  
          status: "success"  
        });

        const totalSpent = payments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );

        return {
          ...user.toObject(),
          orderCount,
          totalSpent,
        };
      })
    );

    res.json(usersWithStats);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};
/// ===============================
////  CREATE USER
/// ===============================
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};


/// ===============================
////  UPDATE USER
/// ===============================
export const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};


/// ===============================
////  DELETE USER
/// ===============================
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
export const getMonthlyRevenue = async (req, res) => {
  try {
    const revenue = await Payment.aggregate([
      {
        $match: { status: "success" }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const formatted = revenue.map(item => ({
      month: months[item._id - 1],
      revenue: item.total
    }));

    res.json(formatted);

  } catch (error) {
    res.status(500).json({
      message: "Monthly revenue error",
      error: error.message
    });
  }
};
/// ===============================
////  GET ALL ORDERS
/// ===============================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};
/// ===============================
///  GET ADMIN PROFILE
/// ===============================
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({
      message: "Profile error",
      error: error.message,
    });
  }
};
/// ===============================
/// 💳 GET ALL PAYMENTS
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "name email") // ✅ FIXED
      .populate("orderId")              // optional
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payments",
      error: error.message,
    });
    
  }
};