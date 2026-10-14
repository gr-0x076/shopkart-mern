import axios from "axios";

// Create Axios instance with backend base URL and credentials enabled
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true, // Crucial: sends & receives HttpOnly cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// API Service Methods
export const registerCustomer = async (customerData) => {
  const response = await api.post("/customers/register", customerData);
  return response.data;
};

export const loginCustomer = async (credentials) => {
  const response = await api.post("/customers/login", credentials);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get("/customers/me");
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await api.post("/customers/logout");
  return response.data;
};

// ─── PRODUCT SERVICE METHODS ──────────────────────────────────────────────────

export const getProducts = async (params = {}) => {
  // params: { search, category, sort }
  const response = await api.get("/products", { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post("/products", productData);
  return response.data;
};

// ─── WISHLIST SERVICE METHODS ─────────────────────────────────────────────────

export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

export const getWishlist = async () => {
  const response = await api.get("/wishlist");
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

// Bonus: single toggle — adds if not saved, removes if saved
export const toggleWishlist = async (productId) => {
  const response = await api.patch(`/wishlist/${productId}/toggle`);
  return response.data;
};

// Bonus: count only — used by Navbar badge
export const getWishlistCount = async () => {
  const response = await api.get("/wishlist/count");
  return response.data;
};

// ─── CART SERVICE METHODS ─────────────────────────────────────────────────────

// Adds product to cart (or increments quantity if already present)
export const addToCart = async (productId) => {
  const response = await api.post(`/cart/${productId}`);
  return response.data;
};

// Returns the current user's full populated cart
export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

// Updates the quantity of a specific cart item
export const updateCartQuantity = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

// Removes a product from the cart entirely
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

// ─── ORDER & CHECKOUT SERVICE METHODS (Lab 06) ────────────────────────────────

// Initiates checkout: validates cart, stock, creates pending order & Razorpay order
export const createPaymentOrder = async (shippingAddress) => {
  const response = await api.post("/orders/create-payment-order", { shippingAddress });
  return response.data;
};

// Verifies Razorpay payment signature, confirms order, decrements stock, clears cart
export const verifyPayment = async (paymentData) => {
  const response = await api.post("/orders/verify-payment", paymentData);
  return response.data;
};

// Returns order history for current customer
export const getMyOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

// Returns a single order by ID
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// Bonus: Updates order status (e.g. PLACED -> CONFIRMED -> SHIPPED -> DELIVERED)
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

export default api;

