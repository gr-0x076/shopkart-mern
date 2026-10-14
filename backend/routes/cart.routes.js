const express = require("express");
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} = require("../controllers/cart.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// All cart routes are protected — authMiddleware validates the JWT cookie
// and attaches req.user so controllers identify the user without client input.

// GET  /cart                   — fetch the current user's populated cart
router.get("/", authMiddleware, getCart);

// POST /cart/:productId        — add product (increments qty if already present)
router.post("/:productId", authMiddleware, addToCart);

// PATCH /cart/:productId       — update quantity for an existing cart item
router.patch("/:productId", authMiddleware, updateCartQuantity);

// DELETE /cart/:productId      — remove a product from the cart
router.delete("/:productId", authMiddleware, removeFromCart);

module.exports = router;
