const express = require("express");
const router = express.Router();
const { processPayment } = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, processPayment);

module.exports = router;
