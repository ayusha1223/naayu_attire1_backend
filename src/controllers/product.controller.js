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
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProduct,
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
    const { category, search } = req.query;

    let filter = {};

    // 🔹 Category filter
    if (category) {
      filter.category = category;
    }

    // 🔹 Search filter (GLOBAL SEARCH)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { color: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};