import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      default: null,
    },

    
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
resetOtp: String,
resetOtpExpiry: Date,
resetOtpAttempts: {
  type: Number,
  default: 0,
},
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);