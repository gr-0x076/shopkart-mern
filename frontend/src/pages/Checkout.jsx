import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, AlertCircle, ShoppingBag, CreditCard, Lock } from "lucide-react";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If script is already in document
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartCount, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const formattedSubtotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(subtotal);

  // If cart is empty, render redirection prompt
  if (!cart || cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-state-container" data-testid="checkout-empty-state">
          <div className="cart-state-icon-circle">
            <ShoppingBag size={32} />
          </div>
          <h2 className="cart-state-title">Your cart is empty</h2>
          <p className="cart-state-subtitle">
            You cannot proceed to checkout without any items in your cart.
          </p>
          <Link to="/products" className="cart-action-btn cart-action-btn--primary">
            Browse Catalogue
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field on type
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    const errors = {};
    const { fullName, phone, addressLine1, city, state, pincode } = formData;

    if (!fullName.trim()) errors.fullName = "Full name is required";
    
    if (!phone.trim()) {
      errors.phone = "Phone number is required";
    } else {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      if (cleanPhone.length < 10) errors.phone = "Enter a valid 10-digit phone number";
    }

    if (!addressLine1.trim()) errors.addressLine1 = "Address is required";
    if (!city.trim()) errors.city = "City is required";
    if (!state.trim()) errors.state = "State is required";

    if (!pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      errors.pincode = "Pincode must be exactly 6 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      // 1. Call server to validate cart, stock, calculate final amount and create Razorpay order
      const res = await createPaymentOrder({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      });

      if (!res.success) {
        setServerError(res.message || "Failed to initiate payment");
        setIsSubmitting(false);
        return;
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = res;

      // 2. Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();

      // If Razorpay SDK loaded and valid key exists, launch Razorpay Standard Checkout
      if (isScriptLoaded && window.Razorpay && key && !key.includes("mock")) {
        const options = {
          key: key,
          amount: amount,
          currency: currency,
          name: "ShopKart Atelier",
          description: `Order #${shopKartOrderId}`,
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              // Verify signature on backend
              const verifyRes = await verifyPayment({
                shopKartOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                clearCart();
                navigate(`/order-success/${shopKartOrderId}`);
              } else {
                setServerError(verifyRes.message || "Payment verification failed");
                setIsSubmitting(false);
              }
            } catch (vErr) {
              setServerError(vErr?.response?.data?.message || "Signature verification failed");
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: formData.fullName,
            contact: formData.phone,
          },
          theme: {
            color: "#B89A5A",
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on("payment.failed", function (failResponse) {
          console.error("Payment failed:", failResponse.error);
          setServerError("Payment was declined or cancelled. Your cart has been preserved.");
          setIsSubmitting(false);
        });
        razorpayInstance.open();
      } else {
        // Fallback / Simulated test mode for development environments
        // Automatically simulates successful test payment verification
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const mockSignature = `mock_sig_${mockPaymentId}`;

        const verifyRes = await verifyPayment({
          shopKartOrderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: mockSignature,
        });

        if (verifyRes.success) {
          clearCart();
          navigate(`/order-success/${shopKartOrderId}`);
        } else {
          setServerError(verifyRes.message || "Failed to confirm order");
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setServerError(err?.response?.data?.message || "Unable to process order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-container checkout-container">
        {/* Header */}
        <div className="cart-page-header">
          <div>
            <div className="cart-breadcrumb">
              <Link to="/cart" className="cart-back-link">
                <ArrowLeft size={14} />
                <span>Return to Cart</span>
              </Link>
            </div>
            <h1 className="cart-main-heading">
              Checkout
              <span className="cart-count-pill">
                <Lock size={12} style={{ display: "inline", marginRight: "4px" }} />
                Secure Order
              </span>
            </h1>
          </div>
          <span className="cart-variety-count">
            {cartCount} {cartCount === 1 ? "unit" : "units"} in order
          </span>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="checkout-error-banner" data-testid="checkout-server-error">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <div className="cart-layout-grid checkout-layout-grid">
          {/* Left Column: Shipping Details Form */}
          <div className="cart-items-column">
            <form onSubmit={handlePlaceOrder} className="checkout-form-card" noValidate>
              <div className="checkout-section-header">
                <h2 className="checkout-section-title">Shipping Address</h2>
                <p className="checkout-section-subtitle">
                  Where should we deliver your order?
                </p>
              </div>

              <div className="checkout-fields-grid">
                {/* Full Name */}
                <div className="checkout-field-group checkout-field-full">
                  <label className="checkout-label" htmlFor="fullName">
                    Full Name <span className="checkout-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className={`checkout-input ${formErrors.fullName ? "checkout-input--error" : ""}`}
                    placeholder="e.g. Aarav Sharma"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {formErrors.fullName && (
                    <span className="checkout-field-error">{formErrors.fullName}</span>
                  )}
                </div>

                {/* Phone */}
                <div className="checkout-field-group">
                  <label className="checkout-label" htmlFor="phone">
                    Phone Number <span className="checkout-required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`checkout-input ${formErrors.phone ? "checkout-input--error" : ""}`}
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {formErrors.phone && (
                    <span className="checkout-field-error">{formErrors.phone}</span>
                  )}
                </div>

                {/* Pincode */}
                <div className="checkout-field-group">
                  <label className="checkout-label" htmlFor="pincode">
                    Pincode <span className="checkout-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    maxLength={6}
                    className={`checkout-input ${formErrors.pincode ? "checkout-input--error" : ""}`}
                    placeholder="6-digit PIN"
                    value={formData.pincode}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {formErrors.pincode && (
                    <span className="checkout-field-error">{formErrors.pincode}</span>
                  )}
                </div>

                {/* Address Line 1 */}
                <div className="checkout-field-group checkout-field-full">
                  <label className="checkout-label" htmlFor="addressLine1">
                    Street Address / Flat No. <span className="checkout-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    className={`checkout-input ${formErrors.addressLine1 ? "checkout-input--error" : ""}`}
                    placeholder="House/Apartment, street, locality"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {formErrors.addressLine1 && (
                    <span className="checkout-field-error">{formErrors.addressLine1}</span>
                  )}
                </div>

                {/* City */}
                <div className="checkout-field-group">
                  <label className="checkout-label" htmlFor="city">
                    City <span className="checkout-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className={`checkout-input ${formErrors.city ? "checkout-input--error" : ""}`}
                    placeholder="e.g. Bengaluru"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {formErrors.city && (
                    <span className="checkout-field-error">{formErrors.city}</span>
                  )}
                </div>

                {/* State */}
                <div className="checkout-field-group">
                  <label className="checkout-label" htmlFor="state">
                    State <span className="checkout-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    className={`checkout-input ${formErrors.state ? "checkout-input--error" : ""}`}
                    placeholder="e.g. Karnataka"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {formErrors.state && (
                    <span className="checkout-field-error">{formErrors.state}</span>
                  )}
                </div>
              </div>

              {/* Payment Section preview */}
              <div className="checkout-payment-preview">
                <div className="checkout-payment-method">
                  <CreditCard size={18} className="checkout-payment-icon" />
                  <div>
                    <span className="checkout-payment-title">Razorpay Standard Checkout (Test Mode)</span>
                    <span className="checkout-payment-sub">Supports UPI, NetBanking, Debit/Credit Cards</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                id="place-order-button"
                className="cart-checkout-btn checkout-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="checkout-btn-loading">
                    <span className="cart-spinner-mini" />
                    <span>Processing Secure Payment...</span>
                  </span>
                ) : (
                  <span>Pay {formattedSubtotal} with Razorpay</span>
                )}
              </button>

              <div className="cart-trust-badge">
                <ShieldCheck size={16} />
                <span>100% Secure 256-Bit SSL Encrypted Payment</span>
              </div>
            </form>
          </div>

          {/* Right Column: Order Review */}
          <div className="cart-summary-column">
            <div className="cart-summary-card">
              <h2 className="cart-summary-title">Order Review</h2>

              {/* Mini Item List */}
              <div className="checkout-review-items">
                {cart.map((item) => {
                  const product = item.product;
                  if (!product) return null;
                  const itemPrice = (product.price || 0) * (item.quantity || 1);
                  return (
                    <div key={product._id} className="checkout-review-item">
                      <div className="checkout-review-thumb">
                        <img
                          src={product.image}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80";
                          }}
                        />
                        <span className="checkout-review-qty-badge">{item.quantity}</span>
                      </div>
                      <div className="checkout-review-details">
                        <span className="checkout-review-name">{product.name}</span>
                        <span className="checkout-review-category">{product.category}</span>
                      </div>
                      <span className="checkout-review-price">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(itemPrice)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span className="summary-row-label">
                    Items Subtotal ({cartCount} {cartCount === 1 ? "unit" : "units"})
                  </span>
                  <span className="summary-row-value">{formattedSubtotal}</span>
                </div>

                <div className="cart-summary-row">
                  <span className="summary-row-label">Shipping</span>
                  <span className="summary-row-value summary-row-value--free">FREE</span>
                </div>

                <div className="cart-summary-row">
                  <span className="summary-row-label">GST & Taxes</span>
                  <span className="summary-row-value summary-row-value--muted">Included</span>
                </div>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-total-row">
                <div>
                  <span className="summary-total-label">Total to Pay</span>
                  <span className="summary-total-note">Inclusive of all duties</span>
                </div>
                <span className="summary-total-price">{formattedSubtotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
