// src/pages/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 text-center px-6">
      {/* Hero section */}
      <div className="max-w-2xl">
        <h1 className="text-5xl font-extrabold text-pink-600 mb-4 drop-shadow-sm">
          🍰 Welcome to Sweet Bites Bakery!
        </h1>
        <p className="text-gray-700 text-lg mb-8">
          Indulge in our freshly baked pastries, cakes, and cookies — made
          with love and the finest ingredients. Treat yourself today!
        </p>

        <button
          onClick={() => navigate("/products")}
          className="bg-pink-500 text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-pink-600 transition"
        >
          🛒 Shop Now
        </button>
      </div>

      {/* Decorative footer */}
      <div className="mt-16 text-gray-400 text-sm">
        <p>“Life is short. Eat dessert first.” 🍪</p>
      </div>
    </div>
  );
}
