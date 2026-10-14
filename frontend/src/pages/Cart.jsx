import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, error, fetchCart, cartCount, subtotal } = useCart();

  const formattedSubtotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(subtotal);

  // ─── 1. LOADING STATE ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-state-container" data-testid="cart-loading-state">
          <div className="cart-loading-pulse" />
          <h2 className="cart-state-title">Loading your cart...</h2>
          <p className="cart-state-subtitle">Retrieving your saved selections</p>
        </div>
      </div>
    );
  }

  // ─── 2. ERROR STATE ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="cart-page">
        <div className="cart-state-container" data-testid="cart-error-state">
          <div className="cart-state-icon-circle cart-state-icon--error">
            <AlertCircle size={28} />
          </div>
          <h2 className="cart-state-title">Unable to load your cart.</h2>
          <p className="cart-state-subtitle">{error}</p>
          <button
            type="button"
            className="cart-action-btn cart-action-btn--primary"
            onClick={fetchCart}
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── 3. EMPTY STATE ─────────────────────────────────────────────────────────
  if (!cart || cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-state-container" data-testid="cart-empty-state">
          <div className="cart-state-icon-circle">
            <ShoppingCart size={32} />
          </div>
          <h2 className="cart-state-title">Your cart is empty 🛒</h2>
          <p className="cart-state-subtitle">Looks like you haven't added anything yet.</p>
          <Link
            to="/products"
            className="cart-action-btn cart-action-btn--primary"
            id="browse-products-empty"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // ─── 4. CART CONTENT ────────────────────────────────────────────────────────
  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Navigation & Title */}
        <div className="cart-page-header">
          <div>
            <div className="cart-breadcrumb">
              <Link to="/products" className="cart-back-link">
                <ArrowLeft size={14} />
                <span>Continue Shopping</span>
              </Link>
            </div>
            <h1 className="cart-main-heading">
              My Cart
              <span className="cart-count-pill" data-testid="cart-count-pill">
                {cartCount} {cartCount === 1 ? "unit" : "units"}
              </span>
            </h1>
          </div>
          <span className="cart-variety-count">
            {cart.length} {cart.length === 1 ? "item" : "items"} selected
          </span>
        </div>

        {/* Two-column layout: Items List & Order Summary */}
        <div className="cart-layout-grid">
          {/* Left Column: Cart Items */}
          <div className="cart-items-column" data-testid="cart-items-list">
            <div className="cart-items-table-header">
              <span>Item details</span>
              <span>Subtotal</span>
            </div>

            <div className="cart-items-list">
              {cart.map((item) => (
                <CartItem key={item.product?._id || item._id} item={item} />
              ))}
            </div>

            <div className="cart-continue-bottom">
              <Link to="/products" className="cart-back-bottom-link">
                <ArrowLeft size={13} />
                Back to catalog to add more
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="cart-summary-column">
            <div className="cart-summary-card" data-testid="cart-order-summary">
              <h2 className="cart-summary-title">Order Summary</h2>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span className="summary-row-label">
                    Subtotal ({cartCount} {cartCount === 1 ? "unit" : "units"})
                  </span>
                  <span className="summary-row-value" data-testid="cart-subtotal">
                    {formattedSubtotal}
                  </span>
                </div>

                <div className="cart-summary-row">
                  <span className="summary-row-label">Estimated Shipping</span>
                  <span className="summary-row-value summary-row-value--free">FREE</span>
                </div>

                <div className="cart-summary-row">
                  <span className="summary-row-label">Taxes & Duties</span>
                  <span className="summary-row-value summary-row-value--muted">Included</span>
                </div>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-total-row">
                <div>
                  <span className="summary-total-label">Total Amount</span>
                  <span className="summary-total-note">Standard delivery included</span>
                </div>
                <span className="summary-total-price" data-testid="cart-total-price">
                  {formattedSubtotal}
                </span>
              </div>

              <button
                type="button"
                className="cart-checkout-btn"
                id="proceed-to-checkout"
                data-testid="proceed-to-checkout"
                onClick={() => {
                  navigate("/checkout");
                }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <div className="cart-trust-badge">
                <ShieldCheck size={16} />
                <span>Secure encrypted checkout & buyer protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
