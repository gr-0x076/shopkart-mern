const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ─── ADD PRODUCT TO WISHLIST ──────────────────────────────────────────────────
// POST /wishlist/:productId
// Auth: required — user identity comes from authMiddleware (req.user), never from body
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Confirm the product actually exists in the catalogue
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 3. Fetch the authenticated user's full document
    const customer = await Customer.findById(req.user._id);

    // 4. Prevent duplicates — one product appears at most once per user
    const alreadySaved = customer.wishlist.some(
      (id) => id.toString() === productId
    );
    if (alreadySaved) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // 5. Push the ObjectId reference and persist
    customer.wishlist.push(productId);
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("addToWishlist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET CURRENT USER'S WISHLIST ─────────────────────────────────────────────
// GET /wishlist
// Auth: required — always loads the calling user's wishlist; client never picks userId
const getWishlist = async (req, res) => {
  try {
    // populate() replaces each ObjectId in wishlist[] with the full Product document.
    // select() limits returned fields — avoids sending __v and unnecessary data.
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name description price category image stock",
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error("getWishlist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── REMOVE PRODUCT FROM WISHLIST ────────────────────────────────────────────
// DELETE /wishlist/:productId
// Auth: required
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Fetch the authenticated user
    const customer = await Customer.findById(req.user._id);

    // 3. Confirm the product is actually in this user's wishlist
    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // 4. Remove by splicing the ObjectId out and saving
    customer.wishlist.splice(index, 1);
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── BONUS: TOGGLE WISHLIST ───────────────────────────────────────────────────
// PATCH /wishlist/:productId/toggle
// Adds if not saved, removes if already saved — returns current saved state
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(req.user._id);
    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let saved;
    if (index === -1) {
      // Not saved → add it
      customer.wishlist.push(productId);
      saved = true;
    } else {
      // Already saved → remove it
      customer.wishlist.splice(index, 1);
      saved = false;
    }

    await customer.save();

    res.status(200).json({
      success: true,
      saved,
      message: saved ? "Product added to wishlist" : "Product removed from wishlist",
    });
  } catch (error) {
    console.error("toggleWishlist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── BONUS: WISHLIST COUNT ────────────────────────────────────────────────────
// GET /wishlist/count
// Returns the number of products in the current user's wishlist
const getWishlistCount = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).select("wishlist");
    res.status(200).json({
      success: true,
      count: customer ? customer.wishlist.length : 0,
    });
  } catch (error) {
    console.error("getWishlistCount error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
};
