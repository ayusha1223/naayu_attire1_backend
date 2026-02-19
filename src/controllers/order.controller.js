import Order from "../models/order.model.js";

export const createOrder = async (req, res) => {
  try {
     console.log("🔥 ORDER ROUTE HIT 🔥");
    console.log("Order body:", req.body);
console.log("User:", req.user);

    const { items, totalAmount, paymentMethod } = req.body;

    const order = await Order.create({
      userId: req.user.id,
      items,
      totalAmount,
      paymentStatus: paymentMethod === "cod" ? "paid" : "pending",
    });

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

