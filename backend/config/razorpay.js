const Razorpay = require("razorpay");

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart_mock";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "shopkart_test_secret_key_mock_12345";

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
  });
} catch (err) {
  console.warn("Razorpay initialization warning:", err.message);
}

module.exports = {
  razorpay: razorpayInstance,
  RAZORPAY_KEY_ID: key_id,
  RAZORPAY_KEY_SECRET: key_secret,
};
