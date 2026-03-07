import express from "express";
import crypto from "crypto";

const router = express.Router();

// ============================
// eSewa Test Credentials
// ============================
const MERCHANT_ID = "EPAYTEST";


const SECRET_KEY = "8gBm/:&EnhH.1/q"; // Test Secret (Official Test Key)

// ============================
// Create eSewa Payment
// ============================
router.post("/create-esewa-payment", (req, res) => {
    // ============================
// Success Route
// ============================
router.get("/success", (req, res) => {
  console.log("eSewa Success Redirect:", req.query);
  res.send("Payment Successful");
});

// ============================
// Failure Route
// ============================
router.get("/failure", (req, res) => {
  console.log("eSewa Failure Redirect:", req.query);
  res.send("Payment Failed");
});
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const transaction_uuid = "order_" + Date.now();

    const total_amount = Number(amount).toFixed(2);

    // ===== SIGNATURE STRING FORMAT=====
    const dataToSign =
      `total_amount=${total_amount},` +
      `transaction_uuid=${transaction_uuid},` +
      `product_code=${MERCHANT_ID}`;

    const signature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(dataToSign)
      .digest("base64");

    return res.json({
      success: true,
      payment: {
        amount: total_amount,
        tax_amount: "0",
        total_amount: total_amount,
        transaction_uuid,
        product_code: MERCHANT_ID,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: "http://192.168.1.74:3000/api/esewa/success",
        failure_url: "http://192.168.1.74:3000/api/esewa/failure",
        signed_field_names:
          "total_amount,transaction_uuid,product_code",
        signature,
      },
    });
  } catch (error) {
    console.error("eSewa Create Error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment initialization failed",
    });
  }
});

export default router;