// src/pages/Checkout.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/api";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import ReactDatePicker from "react-datepicker";
import { getImageUrl } from "../utils/imageUrl";
import "react-datepicker/dist/react-datepicker.css";

export default function Checkout() {
  const { items, subtotal, clearCart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [fulfillment, setFulfillment] = useState("pickup");
  const [pickupTime, setPickupTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = subtotal();

  async function placeOrder() {
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (fulfillment === "pickup" && !pickupTime) {
      setError("Please choose pickup date and time.");
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        setError("You must be logged in to place an order.");
        setLoading(false);
        return;
      }

      const payload = {
        user_id: user.id,
        items: items.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
          customizations: it.customizations || null,
        })),
        fulfillment,
        pickup_time: pickupTime
          ? dayjs(pickupTime).format("YYYY-MM-DD HH:mm:ss")
          : null,
        payment_method: paymentMethod,
      };

      console.log("📦 Sending order payload:", payload);

      const res = await api.post("/orders", payload);
      console.log("✅ Order response:", res.data);

      clearCart();
      toast.success("🎉 Order placed successfully!");

      setTimeout(() => navigate("/orders"), 800);
    } catch (err) {
      console.error("❌ Order failed:", err);
      setError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-pink-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-pink-600">Checkout</h1>
        <button
          onClick={clearCart}
          className="text-sm bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition"
        >
          🗑️ Clear All
        </button>
      </div>


      <h3 className="text-lg mb-3">Cart Items</h3>
      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {items.map((it) => (
            <div
              key={it.product.id}
              className="flex items-center justify-between bg-white p-4 rounded-xl shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-16 h-16 object-cover rounded"
                  src={getImageUrl(it.product.image_url)}
                  alt={it.product.name}
                />
                <div>
                  <div className="font-semibold">{it.product.name}</div>
                  <div className="text-sm text-gray-500">
                    ₱{Number(it.product.base_price).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() =>
                      updateQuantity(it.product.id, it.quantity - 1)
                    }
                  >
                    -
                  </button>
                  <span className="px-3">{it.quantity}</span>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() =>
                      updateQuantity(it.product.id, it.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <div className="font-semibold">
                  ₱{(Number(it.product.base_price) * it.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => removeItem(it.product.id)}
                  className="text-red-500 text-xl"
                >
                  ✖
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
  <h2 className="text-xl font-semibold text-pink-600 mb-4 flex items-center justify-between">
    🧾 Order Details
    <button
      onClick={clearCart}
      className="text-sm text-pink-500 hover:text-pink-700 transition"
    >
      Clear All
    </button>
  </h2>

  {/* Fulfillment Type */}
  <div className="mb-5">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Fulfillment Method
    </label>
    <div className="flex gap-3">
      <button
        type="button"
        className={`flex-1 border rounded-xl px-4 py-2 transition ${
          fulfillment === "pickup"
            ? "bg-pink-500 text-white border-pink-500"
            : "bg-gray-50 hover:bg-gray-100"
        }`}
        onClick={() => setFulfillment("pickup")}
      >
        🏠 Pickup
      </button>
      <button
        type="button"
        className={`flex-1 border rounded-xl px-4 py-2 transition ${
          fulfillment === "delivery"
            ? "bg-pink-500 text-white border-pink-500"
            : "bg-gray-50 hover:bg-gray-100"
        }`}
        onClick={() => setFulfillment("delivery")}
      >
        🚚 Delivery
      </button>
    </div>
  </div>

  {/* Date & Time Picker */}
  <div className="mb-5">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {fulfillment === "pickup"
        ? "Select Pickup Date & Time"
        : "Select Delivery Date & Time"}
    </label>
    <div className="relative">
      <ReactDatePicker
        selected={pickupTime}
        onChange={(date) => setPickupTime(date)}
        showTimeSelect
        timeIntervals={15}
        dateFormat="MMMM d, yyyy h:mm aa"
        placeholderText="Select date and time"
        minDate={new Date()}
        className="w-full border rounded-xl px-3 py-2 bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none text-gray-700"
        wrapperClassName="w-full"
      />
    </div>
  </div>

  {/* Payment Method */}
  <div className="mb-5">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Payment Method
    </label>
    <select
      value={paymentMethod}
      onChange={(e) => setPaymentMethod(e.target.value)}
      className="w-full border rounded-xl px-3 py-2 bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-pink-400 outline-none"
    >
      <option value="gcash">💸 GCash</option>
      <option value="card">💳 Card</option>
      <option value="paypal">🪙 PayPal</option>
      <option value="cod">💵 Cash on Pickup</option>
    </select>
  </div>

  {/* Total + Submit */}
  <div className="flex justify-between items-center mt-6">
    <div>
      <p className="text-sm text-gray-500">Subtotal</p>
      <p className="text-lg font-semibold text-gray-800">
        ₱{Number(total).toFixed(2)}
      </p>
    </div>
    <button
      onClick={placeOrder}
      disabled={loading}
      className="bg-pink-600 text-white px-5 py-2 rounded-full hover:bg-pink-700 transition"
    >
      {loading ? "Placing Order..." : "Place Order"}
    </button>
  </div>

  {error && (
    <div className="text-red-500 mt-3 text-sm text-center">{error}</div>
  )}
</div>
    </div>
  );
}
