const express = require("express");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
} = require("../controllers/wishlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// All wishlist routes are protected — authMiddleware validates the JWT cookie
// and attaches req.user so controllers never need userId from the request body.

// GET  /wishlist/count  — must come BEFORE /:productId to avoid route collision
router.get("/count", authMiddleware, getWishlistCount);

// GET  /wishlist                  — fetch the current user's full wishlist (populated)
router.get("/", authMiddleware, getWishlist);

// POST /wishlist/:productId       — add a product (duplicate-safe)
router.post("/:productId", authMiddleware, addToWishlist);

// DELETE /wishlist/:productId     — remove a product
router.delete("/:productId", authMiddleware, removeFromWishlist);

// PATCH  /wishlist/:productId/toggle — bonus: single toggle action
router.patch("/:productId/toggle", authMiddleware, toggleWishlist);

module.exports = router;
