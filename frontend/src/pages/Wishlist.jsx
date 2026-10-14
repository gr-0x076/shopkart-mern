import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import WishlistCard from "../components/WishlistCard";
import { getWishlist } from "../services/api";

// ─── WISHLIST PAGE ────────────────────────────────────────────────────────────
// Fetches the authenticated user's wishlist from GET /wishlist.
// Handles all three states: loading, empty, error.
// Wishlist data is NEVER hardcoded — always comes from the backend.
const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWishlist();
      setWishlist(data.wishlist || []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setError("Please sign in to view your wishlist.");
      } else {
        setError("Something went wrong. We couldn't load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Called by WishlistCard after successful removal — splices item out optimistically
  const handleRemoved = (removedProductId) => {
    setWishlist((prev) => prev.filter((p) => p._id !== removedProductId));
  };

  return (
    <div className="wishlist-page">
      {/* Hero */}
      <section className="products-hero">
        <div className="products-hero-inner">
          <span className="welcome-eyebrow">My Collection</span>
          <h1 className="products-hero-title">
            <Heart
              size={28}
              fill="currentColor"
              strokeWidth={0}
              style={{ color: "var(--gold)", display: "inline", marginRight: "0.65rem", verticalAlign: "middle" }}
            />
            Wishlist
          </h1>
          {!loading && !error && (
            <p className="products-hero-sub">
              {wishlist.length === 0
                ? "Your saved products will appear here."
                : `${wishlist.length} product${wishlist.length !== 1 ? "s" : ""} saved`}
            </p>
          )}
        </div>
      </section>

      <div className="products-content">

        {/* ── Loading State ── */}
        {loading && (
          <div className="catalog-state-box" id="wishlist-loading" data-testid="wishlist-loading">
            <div className="pulse-spinner" />
            <p className="catalog-state-text">Loading your wishlist...</p>
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="catalog-state-box" id="wishlist-error" data-testid="wishlist-error">
            <div className="catalog-state-icon catalog-state-icon--error">!</div>
            <p className="catalog-state-text">{error}</p>
            <p className="catalog-state-sub">We couldn't load your wishlist.</p>
            <button className="catalog-retry-btn" onClick={fetchWishlist}>
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="catalog-state-box" id="wishlist-empty" data-testid="wishlist-empty">
            <Heart
              size={48}
              strokeWidth={1.2}
              style={{ color: "var(--gold-border)" }}
            />
            <p className="catalog-state-text">Your wishlist is empty</p>
            <p className="catalog-state-sub">
              Save products you love and find them here later.
            </p>
            <Link to="/products" className="wishlist-browse-btn">
              <ShoppingBag size={14} style={{ marginRight: "0.4rem" }} />
              Browse Products
            </Link>
          </div>
        )}

        {/* ── Wishlist Grid ── */}
        {!loading && !error && wishlist.length > 0 && (
          <>
            <p className="products-count">
              {wishlist.length} product{wishlist.length !== 1 ? "s" : ""} saved
            </p>
            <div className="pcard-grid" id="wishlist-grid" data-testid="wishlist-grid">
              {wishlist.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemoved={handleRemoved}
                />
              ))}
            </div>

            {/* Continue shopping link */}
            <div className="wishlist-continue">
              <Link to="/products" className="wishlist-browse-btn">
                <ShoppingBag size={14} style={{ marginRight: "0.4rem" }} />
                Continue Browsing
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Wishlist;
