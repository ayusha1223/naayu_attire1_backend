import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
    },
    rating: {
      type: Number,
      default: 4,
    },
    sizes: [
      {
        type: String,
      },
    ],
    color: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "casual",
        "wedding",
        "party",
        "winter",
        "onepiece",
        "coord",
      ],
    },
    isNew: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;