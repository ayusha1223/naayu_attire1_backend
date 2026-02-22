import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // IMPORTANT
      required: true,
    },

    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
  type: String,
  enum: ["card", "esewa", "cod", "paypal"],
  required: true,
},

    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    refundRequested: {
  type: Boolean,
  default: false,
},
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);