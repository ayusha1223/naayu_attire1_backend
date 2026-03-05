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
    isFlash: {
  type: Boolean,
  default: false,
},
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
      oldPrice: {      // 👈 ADD THIS
    type: Number,
    default: null
  },
discountPercent: {
  type: Number,
  default: 0
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
  required: true,
  enum: [
    "red",
    "green",
    "blue",
    "black",
    "white",
    "pink",
    "yellow",
    "purple",
    "maroon",
    "cream",
    "brown"
  
  ]
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