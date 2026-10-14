import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { toggleWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
// Renders a product with Add to Cart + View Details + Wishlist toggle.
const ProductCard = ({ product, initialWishlisted = false, onWishlistChange }) => {
  const navigate = useNavigate();
  const { addToCart, actionLoading, isInCart, getItemQuantity } = useCart();

  // Wishlist state
  const [wishlistStatus, setWishlistStatus] = useState(
    initialWishlisted ? "saved" : "idle"
  );
  const [wishlistError, setWishlistError] = useState("");
  const [cartFeedback, setCartFeedback] = useState("");

  const isSaved = wishlistStatus === "saved";
  const isSaving = wishlistStatus === "saving";

  // Cart state
  const isAdding = actionLoading[product._id] === "adding";
  const isItemInCart = isInCart(product._id);
  const cartQty = getItemQuantity(product._id);

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price);

  const stockLabel =
    product.stock === 0
      ? "Out of stock"
      : product.stock === 1
      ? "1 unit left"
      : `${product.stock} units left`;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleWishlistToggle = async () => {
    if (isSaving) return;
    setWishlistError("");
    setWishlistStatus("saving");
    try {
      const data = await toggleWishlist(product._id);
      setWishlistStatus(data.saved ? "saved" : "idle");
      if (onWishlistChange) onWishlistChange(product._id, data.saved);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setWishlistError("Sign in to save products.");
      } else {
        setWishlistError("Unable to save product. Please try again.");
      }
      setWishlistStatus(isSaved ? "saved" : "idle");
    }
  };

  const handleAddToCart = async () => {
    if (isAdding || isOutOfStock) return;
    setCartFeedback("");
    const res = await addToCart(product._id);
    if (!res.success) {
      if (res.status === 401) {
        setCartFeedback("Sign in to add items to cart.");
      } else {
        setCartFeedback(res.message || "Failed to add to cart.");
      }
    } else {
      setCartFeedback("Added to cart!");
      setTimeout(() => setCartFeedback(""), 2500);
    }
  };

  return (
    <article className="pcard product-card" data-testid="product-card">
      {/* Image */}
      <div className="pcard-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="pcard-image"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80";
          }}
        />
        <span className="pcard-category-badge">{product.category}</span>
        {isOutOfStock && <span className="pcard-out-badge">Out of stock</span>}

        {/* Floating heart icon on image corner */}
        <button
          className={`pcard-heart-btn ${isSaved ? "pcard-heart-btn--saved" : ""}`}
          onClick={handleWishlistToggle}
          disabled={isSaving}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={16}
            fill={isSaved ? "currentColor" : "none"}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* Body */}
      <div className="pcard-body">
        <h3 className="pcard-name">{product.name}</h3>

        <div className="pcard-footer">
          <span className="pcard-price">{formattedPrice}</span>
          <span
            className={`pcard-stock ${
              isOutOfStock
                ? "pcard-stock--empty"
                : isLowStock
                ? "pcard-stock--low"
                : "pcard-stock--ok"
            }`}
          >
            {stockLabel}
          </span>
        </div>

        {/* Inline Feedback messages */}
        {wishlistError && (
          <p className="pcard-wishlist-error">{wishlistError}</p>
        )}
        {cartFeedback && (
          <p
            className={`pcard-cart-feedback ${
              cartFeedback.includes("Added")
                ? "pcard-cart-feedback--success"
                : "pcard-cart-feedback--error"
            }`}
          >
            {cartFeedback}
          </p>
        )}

        {/* Primary Action: Add to Cart */}
        <button
          id={`add-to-cart-${product._id}`}
          data-testid={`add-to-cart-${product._id}`}
          className={`pcard-btn pcard-add-cart-btn ${
            isItemInCart ? "pcard-add-cart-btn--in-cart" : ""
          } ${isOutOfStock ? "pcard-add-cart-btn--disabled" : ""}`}
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
        >
          {isAdding ? (
            <>
              <span className="pcard-btn-spinner" />
              <span>Adding...</span>
            </>
          ) : isOutOfStock ? (
            <span>Out of Stock</span>
          ) : isItemInCart ? (
            <>
              <ShoppingCart size={13} />
              <span>Add Another ({cartQty})</span>
            </>
          ) : (
            <>
              <ShoppingCart size={13} />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        {/* Secondary actions: Details & Wishlist */}
        <div className="pcard-actions">
          <button
            id={`view-product-${product._id}`}
            className="pcard-btn view-details-btn"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            View Details
          </button>

          <button
            id={`wishlist-btn-${product._id}`}
            className={`pcard-btn pcard-wishlist-btn ${isSaved ? "pcard-wishlist-btn--saved" : ""}`}
            onClick={handleWishlistToggle}
            disabled={isSaving}
            data-testid={`wishlist-btn-${product._id}`}
          >
            {isSaving ? (
              <>
                <span className="pcard-btn-spinner" />
                Saving...
              </>
            ) : isSaved ? (
              <>
                <Heart size={13} fill="currentColor" strokeWidth={1.8} />
                Saved
              </>
            ) : (
              <>
                <Heart size={13} fill="none" strokeWidth={1.8} />
                Wishlist
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
