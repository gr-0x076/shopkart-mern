import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Package, MapPin, Calendar, CreditCard, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { getOrderById, updateOrderStatus } from "../services/api";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOrderById(id);
      if (res.success) {
        setOrder(res.order);
      } else {
        setError(res.message || "Failed to load order");
      }
    } catch (err) {
      console.error("fetchOrder error:", err);
      setError(err?.response?.data?.message || "Order not found or access denied");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (nextStatus) => {
    if (updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await updateOrderStatus(order._id, nextStatus);
      if (res.success) {
        setOrder(res.order);
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-state-container">
          <div className="cart-loading-pulse" />
          <h2 className="cart-state-title">Loading order details...</h2>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="cart-page">
        <div className="cart-state-container">
          <div className="cart-state-icon-circle cart-state-icon--error">
            <AlertCircle size={28} />
          </div>
          <h2 className="cart-state-title">Unable to find this order</h2>
          <p className="cart-state-subtitle">{error || "Order does not exist or unauthorized"}</p>
          <Link to="/orders" className="cart-action-btn cart-action-btn--primary">
            <ArrowLeft size={14} />
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(order.totalAmount);

  const statusSteps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="cart-page">
      <div className="cart-container order-details-container">
        {/* Navigation Breadcrumb */}
        <div className="cart-page-header">
          <div>
            <div className="cart-breadcrumb">
              <Link to="/orders" className="cart-back-link">
                <ArrowLeft size={14} />
                <span>All Orders</span>
              </Link>
            </div>
            <h1 className="cart-main-heading">Order #{order._id}</h1>
          </div>
          <span className="cart-variety-count">Placed on {formattedDate}</span>
        </div>

        {/* Status Tracker */}
        <div className="order-details-tracker-card">
          <h2 className="tracker-card-title">Fulfillment Progress</h2>
          <div className="order-progress-steps">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={step}
                  className={`progress-step-item ${isCompleted ? "progress-step--completed" : ""} ${
                    isCurrent ? "progress-step--current" : ""
                  }`}
                >
                  <div className="progress-step-circle">
                    {idx + 1}
                  </div>
                  <span className="progress-step-label">{step}</span>
                </div>
              );
            })}
          </div>

          {/* Bonus: Dev Status Simulation Controller */}
          <div className="order-dev-controls">
            <span className="order-dev-label">Simulate Status (Bonus Progression):</span>
            <div className="order-dev-buttons">
              {statusSteps.map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={updatingStatus || order.status === st}
                  className={`dev-status-btn ${order.status === st ? "dev-status-btn--active" : ""}`}
                  onClick={() => handleStatusChange(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="cart-layout-grid">
          {/* Left: Items list */}
          <div className="cart-items-column">
            <div className="order-details-items-card">
              <h2 className="checkout-section-title">Items in this Order ({order.items.length})</h2>

              <div className="order-card-items-preview">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-card-item-row">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="order-card-item-thumb"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80";
                      }}
                    />
                    <div className="order-card-item-info">
                      <span className="order-card-item-name">{item.name}</span>
                      <span className="order-card-item-qty">
                        Units: {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span className="order-card-item-total">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Payment & Address Summary */}
          <div className="cart-summary-column">
            <div className="cart-summary-card">
              <h2 className="cart-summary-title">Summary & Payment</h2>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span className="summary-row-label">Payment Status</span>
                  <span className="receipt-pill receipt-pill--paid">{order.paymentStatus}</span>
                </div>
                <div className="cart-summary-row">
                  <span className="summary-row-label">Payment Gateway</span>
                  <span className="summary-row-value">Razorpay Test Mode</span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="cart-summary-row">
                    <span className="summary-row-label">Payment ID</span>
                    <span className="receipt-value receipt-value--mono" style={{ fontSize: "0.8rem" }}>
                      {order.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-total-row">
                <span className="summary-total-label">Total Amount Paid</span>
                <span className="summary-total-price">{formattedTotal}</span>
              </div>

              <div className="cart-summary-divider" />

              {/* Delivery Address */}
              {order.shippingAddress && (
                <div className="order-details-address">
                  <div className="receipt-address-header">
                    <MapPin size={14} />
                    <span>Shipping Address</span>
                  </div>
                  <p className="order-details-address-text">
                    <strong>{order.shippingAddress.fullName}</strong><br />
                    Phone: {order.shippingAddress.phone}<br />
                    {order.shippingAddress.addressLine1}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
