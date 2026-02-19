const Payment = require("../models/payment.model");
const Order = require("../models/order.model");

exports.processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, transactionId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payment = await Payment.create({
      orderId,
      userId: req.user.id,
      amount: order.totalAmount,
      paymentMethod,
      transactionId,
      status: "success",
    });

    order.paymentStatus = "paid";
    await order.save();

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
