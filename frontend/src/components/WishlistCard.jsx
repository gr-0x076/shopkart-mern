import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ExternalLink, Trash2 } from "lucide-react";
import { removeFromWishlist } from "../services/api";

// ─── WISHLIST CARD ────────────────────────────────────────────────────────────
// Displays a saved product with View Details + Remove actions.
// onRemoved: callback so the Wishlist page can splice the item out immediately
const WishlistCard = ({ product, onRemoved }) => {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const stockLabel =
    product.stock === 0
      ? "Out of stock"
      : product.stock === 1
      ? "1 unit left"
      : `${product.stock} units left`;

  const handleRemove = async () => {
    if (removing) return;
    setRemoveError("");
    setRemoving(true);
    try {
      await removeFromWishlist(product._id);
      onRemoved(product._id);
    } catch (err) {
      setRemoveError("Could not remove. Try again.");
      setRemoving(false);
    }
  };

  return (
    <article className="wcard" data-testid="wishlist-card">
      {/* Image */}
      <div className="wcard-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="wcard-image"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80";
          }}
        />
        <span className="pcard-category-badge">{product.category}</span>
        {isOutOfStock && <span className="pcard-out-badge">Out of stock</span>}
        {/* Saved indicator */}
        <span className="wcard-saved-pill">
          <Heart size={10} fill="currentColor" strokeWidth={0} />
          Saved
        </span>
      </div>

      {/* Body */}
      <div className="wcard-body">
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

        {removeError && (
          <p className="pcard-wishlist-error">{removeError}</p>
        )}

        {/* Actions */}
        <div className="pcard-actions">
          <button
            id={`wcard-view-${product._id}`}
            className="pcard-btn view-details-btn"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            <ExternalLink size={12} style={{ marginRight: "0.35rem" }} />
            View Details
          </button>

          <button
            id={`wcard-remove-${product._id}`}
            className="pcard-btn wcard-remove-btn"
            onClick={handleRemove}
            disabled={removing}
            data-testid={`remove-wishlist-${product._id}`}
          >
            {removing ? (
              <>
                <span className="pcard-btn-spinner" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 size={12} style={{ marginRight: "0.35rem" }} />
                Remove
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default WishlistCard;
