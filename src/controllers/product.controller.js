import Product from "../models/product.model.js";

// ✅ Create Product (Admin)
export const createProduct = async (req, res) => {
  try {
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      rating: req.body.rating,
      color: req.body.color,
      isNew: req.body.isNew,
      category: req.body.category,
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      color,
      oldPrice
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name;
    product.price = price;
    product.description = description;
    product.category = category;
    product.color = color;

    // 🔥 VERY IMPORTANT
    product.oldPrice = oldPrice ?? null;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get Products (User side)
export const getProducts = async (req, res) => {
  try {
    const { category, search, isFlash } = req.query;

    let filter = {};

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Flash filter
    if (isFlash !== undefined) {
      filter.isFlash = isFlash === "true";
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { color: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: products.length,
      data: products,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

