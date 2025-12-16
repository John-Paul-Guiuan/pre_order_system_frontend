// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";

// Loading screen component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B3611B] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// ✅ Route requiring login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

// ✅ Prevent logged-in users from opening login/register
function AuthOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return children;
  // Redirect based on role
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/" replace />;
}

// 🚨 NEW: Admin-only route
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  // Still loading user info? Show loading screen
  if (loading) return <LoadingScreen />;

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // No role field OR not admin
  if (!user.role || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}


export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2500,
              style: { background: "#f472b6", color: "#fff", borderRadius: "10px" },
            }}
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-pink-50">

      {/* Show navbar only for regular users */}
      {user && user.role === "user" && <Navbar />}

      <Routes>

        {/* 🛑 ADMIN ROUTES (protected) */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />

        {/* 👤 Auth routes */}
        <Route
          path="/login"
          element={
            <AuthOnlyRoute>
              <Login />
            </AuthOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <AuthOnlyRoute>
              <Register />
            </AuthOnlyRoute>
          }
        />

        {/* 👨‍🍳 USER ROUTES (protected) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Default fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                user
                  ? user.role === "admin"
                    ? "/admin/dashboard"
                    : "/"
                  : "/login"
              }
              replace
            />
          }
        />
      </Routes>
    </div>
  );
}
