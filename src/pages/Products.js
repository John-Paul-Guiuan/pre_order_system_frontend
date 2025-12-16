// src/pages/Products.js
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/imageUrl";
import toast from "react-hot-toast";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({});

  // ✅ Fetch products from backend
  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        setProducts(res.data.data || res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // ✅ Adjust quantity per product
  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  // ✅ Add to cart and reset quantity
  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    addToCart(product, qty);
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
    toast.success(`${product.name} added to cart! 🛒`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-pink-50 min-h-screen">
  {[...Array(8)].map((_, i) => (
    <div
      key={i}
      className="bg-white rounded-2xl p-4 shadow animate-pulse flex flex-col items-center"
    >
      <div className="w-full h-40 bg-pink-100 rounded-xl mb-4"></div>
      <div className="w-3/4 h-4 bg-pink-200 rounded mb-2"></div>
      <div className="w-1/2 h-4 bg-pink-200 rounded"></div>
    </div>
  ))}
</div>

    );
  }


  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-8">
        🍰 Our Sweet Selections
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => {
            const unavailable = !product.is_available || product.is_available === 0;
            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl shadow-md p-4 flex flex-col items-center transition-transform relative ${
                  unavailable ? "opacity-60 grayscale pointer-events-none" : "hover:scale-105"
                }`}
              >
                <img
                  src={getImageUrl(product.image_url)}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
                <h2 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h2>
                <p className="text-pink-600 font-bold mt-2">
                  ₱{Number(product.base_price).toFixed(2)}
                </p>

                {unavailable && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow">
                    Out of Stock
                  </span>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <button
                    className="bg-gray-200 px-3 py-1 rounded-full"
                    onClick={() => handleQuantityChange(product.id, -1)}
                    disabled={unavailable}
                  >
                    -
                  </button>
                  <span>{quantities[product.id] || 1}</span>
                  <button
                    className="bg-gray-200 px-3 py-1 rounded-full"
                    onClick={() => handleQuantityChange(product.id, +1)}
                    disabled={unavailable}
                  >
                    +
                  </button>
                </div>

                <button
                  className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={() => handleAddToCart(product)}
                  disabled={unavailable}
                >
                  {unavailable ? "Unavailable" : "Add to Cart"}
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-600 col-span-full">
            No products found.
          </p>
        )}
      </div>
    </div>
  );
}
