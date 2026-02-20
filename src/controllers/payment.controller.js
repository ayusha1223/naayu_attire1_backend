import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";

export const processPayment = async (req, res) => {
  try {
    console.log("Payment body:", req.body);

    const { orderId, paymentMethod, transactionId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

  const payment = await Payment.create({
  orderId,
  userId: req.user._id, 
  amount: order.totalAmount,
  paymentMethod,
  transactionId,
  status: "success",
});

    order.paymentStatus = "paid";
    await order.save();

    res.status(200).json({
      message: "Payment successful",
      payment,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

