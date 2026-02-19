const Order = require("../models/order.model");

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    const newOrder = await Order.create({
      userId: req.user.id,
      items,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
