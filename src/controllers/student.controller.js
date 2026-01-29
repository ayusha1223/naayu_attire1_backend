import Student from "../models/student.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= REGISTER =================
export const registerStudent = async (req, res) => {
  try {
    console.log("🔥🔥 REGISTER API HIT FROM FLUTTER 🔥🔥");
    console.log("REQUEST BODY:", req.body);

    const { name, email, password } = req.body;

    const exists = await Student.findOne({ email });
    console.log("EMAIL EXISTS CHECK:", exists);

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("✅ STUDENT CREATED:", student);

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= LOGIN =================
export const loginStudent = async (req, res) => {
  try {
    console.log("🔥 LOGIN API HIT");

    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        token,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= UPLOAD IMAGE =================
export const uploadStudentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = `http://localhost:${process.env.PORT}/uploads/${req.file.filename}`;

    await Student.findByIdAndUpdate(req.studentId, {
      imageUrl,
    });

    res.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("IMAGE UPLOAD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
