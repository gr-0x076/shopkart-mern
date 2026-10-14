# 🛍️ ShopKart — Full-Stack MERN E-Commerce Application

A production-style luxury e-commerce web platform built with **React**, **Node.js**, **Express**, **MongoDB**, and **Razorpay Standard Checkout**.

---

## 🌟 Key Features

- **Authentication & Authorization**:
  - Secure registration and login using bcrypt password hashing.
  - HttpOnly JWT cookies for session management with CSRF/XSS protection.
  - Protected API routes verified via custom authentication middleware.
- **Product Catalog**:
  - Dynamic product browsing with live category filtering, searching, and sorting.
  - Individual product details view with real-time inventory tracking.
- **Wishlist (Lab 04)**:
  - Persistent MongoDB ObjectId references (`ref: "Product"`).
  - Add, remove, and toggle favorites with duplicate prevention (`409 Conflict`).
- **Shopping Cart (Lab 05)**:
  - React Context API (`CartContext`) for global reactive state without prop drilling.
  - Live stock validation, item increment/decrement, and line item calculations with `useMemo`.
- **Checkout & Orders (Lab 06)**:
  - Multi-step checkout with real-time address validation (10-digit phone, 6-digit pin).
  - Server-side stock re-verification and price calculation (ignoring client-tampered totals).
  - **Razorpay Standard Checkout** with HMAC-SHA256 signature verification.
  - Purchase snapshot architecture (preserves purchase-time pricing/details in Order history).
  - Inventory decrement and automated cart clearance upon verified payment.
  - Order history tracking and status fulfillment progression (`PLACED` → `CONFIRMED` → `SHIPPED` → `DELIVERED`).

---

## 🏗️ Tech Stack

- **Frontend**: React 19, React Router v7, Axios, Lucide React, Vite, Custom Luxury CSS
- **Backend**: Node.js, Express.js 5, Mongoose 9, Razorpay SDK, Cookie Parser, JSON Web Token (JWT)
- **Database**: MongoDB Atlas (with in-memory fallback for local development)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/gr-0x076/shopkart-mern.git
cd shopkart-mern
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas URI, JWT Secret, and Razorpay credentials
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and communicate with the backend at `http://localhost:5000`.

---

## 📄 License
ISC
