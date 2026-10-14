const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    // ─── WISHLIST RELATIONSHIP ────────────────────────────────────────────────
    // Stores Product ObjectId references — NOT embedded product objects.
    // Product collection remains the single source of truth for all product data.
    // Use populate("wishlist") to retrieve the full product documents.
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // ─── CART RELATIONSHIP ────────────────────────────────────────────────────
    // Each cart entry stores a Product reference + quantity.
    // Quantity tracks units; price is NOT duplicated here — always read from
    // the Product document so the latest price is shown at checkout.
    // Use populate("cart.product") to retrieve full Product documents.
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);
