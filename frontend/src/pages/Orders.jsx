import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Calendar, Clock, MapPin, ChevronRight, AlertCircle, RefreshCw, ShoppingBag } from "lucide-react";
import { getMyOrders } from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyOrders();
      if (res.success) {
        setOrders(res.orders || []);
      } else {
        setError(res.message || "Failed to load orders");
      }
    } catch (err) {
      console.error("fetchOrders error:", err);
      setError(err?.response?.data?.message || "Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 1. Loading State
  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-state-container">
          <div className="cart-loading-pulse" />
          <h2 className="cart-state-title">Loading your orders...</h2>
          <p className="cart-state-subtitle">Retrieving historical purchase ledger</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="cart-page">
        <div className="cart-state-container">
          <div className="cart-state-icon-circle cart-state-icon--error">
            <AlertCircle size={28} />
          </div>
          <h2 className="cart-state-title">Unable to load your orders</h2>
          <p className="cart-state-subtitle">{error}</p>
          <button
            type="button"
            className="cart-action-btn cart-action-btn--primary"
            onClick={fetchOrders}
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (!orders || orders.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-state-container">
          <div className="cart-state-icon-circle">
            <Package size={32} />
          </div>
          <h2 className="cart-state-title">You have not placed any orders yet</h2>
          <p className="cart-state-subtitle">
            Explore the ShopKart atelier catalogue and place your first order.
          </p>
          <Link to="/products" className="cart-action-btn cart-action-btn--primary">
            <ShoppingBag size={14} />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container orders-container">
        <div className="cart-page-header">
          <div>
            <span className="orders-kicker">Purchased Selections</span>
            <h1 className="cart-main-heading">My Orders</h1>
          </div>
          <span className="cart-variety-count">
            {orders.length} {orders.length === 1 ? "order" : "orders"} placed
          </span>
        </div>

        <div className="orders-list">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const formattedTotal = new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(order.totalAmount);

            const totalUnits = (order.items || []).reduce(
              (sum, it) => sum + (it.quantity || 1),
              0
            );

            return (
              <div key={order._id} className="order-history-card">
                {/* Header Row */}
                <div className="order-card-header">
                  <div className="order-card-meta">
                    <span className="order-card-id">Order #{order._id}</span>
                    <span className="order-card-date">
                      <Calendar size={13} style={{ display: "inline", marginRight: "4px" }} />
                      {formattedDate} at {formattedTime}
                    </span>
                  </div>

                  <div className="order-card-badges">
                    <span className={`order-status-badge order-status--${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                    <span className={`order-payment-badge order-payment--${order.paymentStatus.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items Row */}
                <div className="order-card-items-preview">
                  {order.items && order.items.map((item, idx) => (
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
                          Quantity: {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="order-card-item-total">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Row */}
                <div className="order-card-footer">
                  <div className="order-card-total-box">
                    <span className="order-card-total-label">
                      Total ({totalUnits} {totalUnits === 1 ? "unit" : "units"})
                    </span>
                    <span className="order-card-total-amount">{formattedTotal}</span>
                  </div>

                  <Link to={`/orders/${order._id}`} className="order-card-view-btn">
                    <span>View Details</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;
