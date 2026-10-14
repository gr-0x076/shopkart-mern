const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ─── HELPER: build the populated cart response ────────────────────────────────
// Shared by every mutating endpoint so the frontend always gets a consistent
// cart shape without an extra round-trip.
const populatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: "cart.product",
    select: "name description price category image stock",
  });
  return customer ? customer.cart : [];
};

// ─── ADD PRODUCT TO CART ──────────────────────────────────────────────────────
// POST /cart/:productId
// Auth: required.
// If the product is already in the cart its quantity is incremented by 1.
// If it is not yet in the cart it is added with quantity = 1.
// In both cases the new quantity is validated against current stock.
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    // 2. Confirm product exists and read latest stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 3. Fetch the authenticated user
    const customer = await Customer.findById(req.user._id);

    // 4. Check if this product is already in the cart
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Increment quantity
      const newQty = existingItem.quantity + 1;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} unit${product.stock === 1 ? "" : "s"} available`,
        });
      }
      existingItem.quantity = newQty;
    } else {
      // Product not in cart — add it with quantity 1
      if (product.stock < 1) {
        return res.status(400).json({ success: false, message: "Product is out of stock" });
      }
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    const cart = await populatedCart(req.user._id);
    res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET CURRENT USER'S CART ──────────────────────────────────────────────────
// GET /cart
// Auth: required.
// Returns the populated cart — Product documents are embedded so the frontend
// always displays the most current price / stock / image.
const getCart = async (req, res) => {
  try {
    const cart = await populatedCart(req.user._id);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── UPDATE QUANTITY ──────────────────────────────────────────────────────────
// PATCH /cart/:productId
// Body: { quantity: Number }
// Auth: required.
// Replaces the current quantity with the supplied value.
// Quantity must be >= 1 and <= current product stock.
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    // 2. Validate quantity value
    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    // 3. Read latest stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit${product.stock === 1 ? "" : "s"} available`,
      });
    }

    // 4. Find and update the cart item
    const customer = await Customer.findById(req.user._id);
    const item = customer.cart.find(
      (i) => i.product.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    item.quantity = qty;
    await customer.save();

    const cart = await populatedCart(req.user._id);
    res.status(200).json({ success: true, message: "Quantity updated", cart });
  } catch (error) {
    console.error("updateCartQuantity error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── REMOVE PRODUCT FROM CART ─────────────────────────────────────────────────
// DELETE /cart/:productId
// Auth: required.
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const customer = await Customer.findById(req.user._id);

    const index = customer.cart.findIndex(
      (i) => i.product.toString() === productId
    );
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    customer.cart.splice(index, 1);
    await customer.save();

    const cart = await populatedCart(req.user._id);
    res.status(200).json({ success: true, message: "Product removed from cart", cart });
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { addToCart, getCart, updateCartQuantity, removeFromCart };
