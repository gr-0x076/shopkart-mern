import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
} from "../services/api";

const CartContext = createContext(null);

export const CartProvider = ({ children, user }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Track loading per item/action to avoid locking the entire page
  // e.g. { [productId]: 'adding' | 'updating' | 'removing' }
  const [actionLoading, setActionLoading] = useState({});

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    // If not authenticated, cart is empty
    if (!user) {
      setCart([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      if (data && data.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      // 401 means not authenticated, cart stays empty
      if (err?.response?.status === 401) {
        setCart([]);
      } else {
        console.error("fetchCart error:", err);
        setError(err?.response?.data?.message || "Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Re-fetch cart whenever user logs in, out, or changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add product to cart (or increment quantity if already present)
  const addToCart = async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: "adding" }));
    setError(null);
    try {
      const data = await apiAddToCart(productId);
      if (data && data.cart) {
        setCart(data.cart);
      }
      return { success: true, message: data?.message || "Item added to cart", cart: data?.cart };
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add item to cart";
      return { success: false, message: msg, status: err?.response?.status };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // Update quantity of an existing cart item
  const updateQuantity = async (productId, newQuantity) => {
    setActionLoading((prev) => ({ ...prev, [productId]: "updating" }));
    setError(null);
    try {
      const data = await apiUpdateCartQuantity(productId, newQuantity);
      if (data && data.cart) {
        setCart(data.cart);
      }
      return { success: true, message: data?.message || "Quantity updated", cart: data?.cart };
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update quantity";
      return { success: false, message: msg, status: err?.response?.status };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // Remove a product from the cart
  const removeFromCart = async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: "removing" }));
    setError(null);
    try {
      const data = await apiRemoveFromCart(productId);
      if (data && data.cart) {
        setCart(data.cart);
      }
      return { success: true, message: data?.message || "Item removed from cart", cart: data?.cart };
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to remove item";
      return { success: false, message: msg, status: err?.response?.status };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // Derived values — calculated dynamically from state, never stored separately in DB
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;
      const qty = item.quantity || 0;
      return total + price * qty;
    }, 0);
  }, [cart]);

  const isInCart = useCallback(
    (productId) => {
      return cart.some((item) => {
        const id = item.product?._id || item.product;
        return id === productId;
      });
    },
    [cart]
  );

  const getItemQuantity = useCallback(
    (productId) => {
      const item = cart.find((i) => {
        const id = i.product?._id || i.product;
        return id === productId;
      });
      return item ? item.quantity : 0;
    },
    [cart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const value = {
    cart,
    cartItems: cart, // alias for convenience
    loading,
    error,
    actionLoading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    subtotal,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
