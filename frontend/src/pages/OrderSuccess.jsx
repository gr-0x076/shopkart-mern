import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, ShoppingBag, MapPin, Calendar, Clock } from "lucide-react";
import { getOrderById } from "../services/api";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getOrderById(id)
        .then((res) => {
          if (res.success) setOrder(res.order);
        })
        .catch((err) => console.error("Error fetching confirmed order:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const formattedTotal = order?.totalAmount
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(order.totalAmount)
    : "";

  return (
    <div className="cart-page">
      <div className="cart-container order-success-container">
        <div className="order-success-card">
          <div className="order-success-badge">
            <CheckCircle2 size={44} className="order-success-icon" />
          </div>

          <span className="order-success-kicker">Payment Verified & Confirmed</span>
          <h1 className="order-success-title">Order Placed Successfully</h1>
          <p className="order-success-subtitle">
            Thank you for your purchase. Your order has been registered in the ShopKart system and is being prepared for dispatch.
          </p>

          {order && (
            <div className="order-success-receipt">
              <div className="receipt-grid">
                <div className="receipt-item">
                  <span className="receipt-label">Order Reference</span>
                  <span className="receipt-value receipt-value--mono">{order._id}</span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">Payment Status</span>
                  <span className="receipt-pill receipt-pill--paid">{order.paymentStatus}</span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">Order Status</span>
                  <span className="receipt-pill receipt-pill--status">{order.status}</span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">Total Amount Paid</span>
                  <span className="receipt-value receipt-value--gold">{formattedTotal}</span>
                </div>
              </div>

              {/* Delivery Address Snapshot */}
              {order.shippingAddress && (
                <div className="receipt-address-box">
                  <div className="receipt-address-header">
                    <MapPin size={14} />
                    <span>Shipping Destination</span>
                  </div>
                  <p className="receipt-address-text">
                    <strong>{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})<br />
                    {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state} — {order.shippingAddress.pincode}
                  </p>
                </div>
              )}

              {/* Snapshot Items Preview */}
              {order.items && order.items.length > 0 && (
                <div className="receipt-items-list">
                  <span className="receipt-items-title">Purchased Items ({order.items.length})</span>
                  <div className="receipt-items-grid">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="receipt-mini-item">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="receipt-mini-thumb"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80";
                          }}
                        />
                        <div className="receipt-mini-meta">
                          <span className="receipt-mini-name">{item.name}</span>
                          <span className="receipt-mini-qty">
                            Qty: {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="order-success-actions">
            <Link to="/orders" className="cart-action-btn cart-action-btn--primary">
              <Package size={15} />
              <span>View My Orders</span>
            </Link>
            <Link to="/products" className="cart-action-btn cart-action-btn--secondary">
              <ShoppingBag size={15} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
