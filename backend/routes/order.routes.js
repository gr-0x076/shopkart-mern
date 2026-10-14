const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");

// All order endpoints are strictly protected by authMiddleware
router.use(authMiddleware);

// Checkout & Razorpay Payment integration
router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);

// Order history & details
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

// Bonus: Order status progression
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
