import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";


// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ================= FORGOT PASSWORD (SEND OTP) =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.resetOtpAttempts = 0;

    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Naayu Attire Password Reset Code",
      text: `
Hello ${user.name},

Your 6-digit password reset code is:

${otp}

This code will expire in 10 minutes.

If you did not request this, please ignore this email.
      `,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ================= VERIFY OTP =================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const enteredOtp = otp.trim();

    if (!user.resetOtp) {
      return res.status(400).json({
        success: false,
        message: "No OTP found",
      });
    }

    if (user.resetOtp.toString() !== enteredOtp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ================= RESET PASSWORD (AFTER OTP VERIFIED) =================
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear OTP
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    user.resetOtpAttempts = 0;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= UPLOAD IMAGE =================
export const uploadUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file received",
      });
    }

    const imageUrl = `http://${req.headers.host}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      imageUrl,
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};


// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const { name, password, phone } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update name
    if (name && name.trim() !== "") {
      user.name = name;
    }

    // Update phone
    if (phone) {
      user.phone = phone;
    }

    // Update password
    if (password && password.length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};