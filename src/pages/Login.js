// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";
import Home from "./Home";
import AdminDashboard from "./admin/AdminDashboard";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedInUser = await login(form.email, form.password);

      console.log("✅ Login successful. User:", loggedInUser);
      toast.success(`Welcome back, ${loggedInUser.name}! 🎉`);

      // Role-based redirect
      if (loggedInUser.role === "admin") {
        console.log("🔐 Redirecting to admin dashboard...");
        navigate("/admin/dashboard", { replace: true });
      } else if (loggedInUser.role === "customer") {
        console.log("🛍️ Redirecting to customer home (products)...");
        navigate("/", { replace: true });
      } else {
        console.warn("⚠️ Unknown role:", loggedInUser.role);
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);

      let message = "Invalid credentials. Please try again.";

      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (errors && typeof errors === "object") {
          const errorMessages = Object.values(errors).flat();
          message = errorMessages.join(", ");
        }
      }

      setError(message);
      toast.error("Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/assets/cakes-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <img src={logo} alt="Sweet Bite Logo" className="w-16 h-16 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">
           Sweet Bite!
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="text-pink-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
