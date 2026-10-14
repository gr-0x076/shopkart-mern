import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, actionLoading } = useCart();
  const [localError, setLocalError] = useState("");

  const product = item?.product;
  if (!product) return null;

  const currentLoading = actionLoading[product._id];
  const isUpdating = currentLoading === "updating";
  const isRemoving = currentLoading === "removing";
  const isBusy = !!currentLoading;

  const price = product.price || 0;
  const quantity = item.quantity || 1;
  const itemTotal = price * quantity;
  const stock = product.stock ?? 0;

  const formattedUnitPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  const formattedItemTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(itemTotal);

  const handleDecrease = async () => {
    if (quantity <= 1 || isBusy) return;
    setLocalError("");
    const res = await updateQuantity(product._id, quantity - 1);
    if (!res.success) {
      setLocalError(res.message || "Failed to update quantity");
    }
  };

  const handleIncrease = async () => {
    if (quantity >= stock || isBusy) return;
    setLocalError("");
    const res = await updateQuantity(product._id, quantity + 1);
    if (!res.success) {
      setLocalError(res.message || "Failed to update quantity");
    }
  };

  const handleRemove = async () => {
    if (isBusy) return;
    setLocalError("");
    const res = await removeFromCart(product._id);
    if (!res.success) {
      setLocalError(res.message || "Failed to remove item");
    }
  };

  const isAtMaxStock = quantity >= stock;
  const isAtMinQty = quantity <= 1;

  return (
    <div
      className={`cart-item-row ${isRemoving ? "cart-item-row--removing" : ""}`}
      id={`cart-item-${product._id}`}
      data-testid={`cart-item-${product._id}`}
    >
      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="cart-item-thumb-link">
        <div className="cart-item-thumb">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80";
            }}
          />
        </div>
      </Link>

      {/* Details & Info */}
      <div className="cart-item-info">
        <div className="cart-item-header">
          <Link to={`/products/${product._id}`} className="cart-item-title">
            {product.name}
          </Link>
          <span className="cart-item-category">{product.category}</span>
        </div>

        <div className="cart-item-price-meta">
          <span className="cart-item-unit-price">{formattedUnitPrice} each</span>
          {stock <= 5 && stock > 0 && (
            <span className="cart-item-stock-warning">
              Only {stock} available
            </span>
          )}
          {stock === 0 && (
            <span className="cart-item-stock-warning cart-item-stock-warning--out">
              Out of stock
            </span>
          )}
        </div>

        {/* Local Error feedback if quantity update or removal fails */}
        {localError && (
          <div className="cart-item-error">
            <AlertCircle size={12} />
            <span>{localError}</span>
          </div>
        )}

        {/* Quantity Controls & Line Total */}
        <div className="cart-item-controls-bar">
          <div className="cart-quantity-selector" data-testid={`qty-selector-${product._id}`}>
            <button
              type="button"
              className="cart-qty-btn cart-qty-btn--minus"
              onClick={handleDecrease}
              disabled={isAtMinQty || isBusy}
              aria-label="Decrease quantity"
              title={isAtMinQty ? "Minimum quantity is 1" : "Decrease quantity"}
              data-testid={`qty-minus-${product._id}`}
            >
              <Minus size={13} />
            </button>

            <span className="cart-qty-value" data-testid={`qty-val-${product._id}`}>
              {isUpdating ? <span className="cart-spinner-mini" /> : quantity}
            </span>

            <button
              type="button"
              className="cart-qty-btn cart-qty-btn--plus"
              onClick={handleIncrease}
              disabled={isAtMaxStock || isBusy}
              aria-label="Increase quantity"
              title={isAtMaxStock ? `Max stock reached (${stock})` : "Increase quantity"}
              data-testid={`qty-plus-${product._id}`}
            >
              <Plus size={13} />
            </button>
          </div>

          {isAtMaxStock && stock > 0 && (
            <span className="cart-item-max-notice">Max stock</span>
          )}

          <div className="cart-item-total-col">
            <span className="cart-item-subtotal-label">Total</span>
            <span className="cart-item-subtotal-val" data-testid={`item-total-${product._id}`}>
              {formattedItemTotal}
            </span>
          </div>

          <button
            type="button"
            className="cart-item-remove-btn"
            onClick={handleRemove}
            disabled={isBusy}
            aria-label="Remove item from cart"
            title="Remove item"
            data-testid={`remove-item-${product._id}`}
          >
            {isRemoving ? (
              <span className="cart-spinner-mini" />
            ) : (
              <>
                <Trash2 size={14} />
                <span className="remove-text">Remove</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
