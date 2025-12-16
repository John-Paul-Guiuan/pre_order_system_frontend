// src/pages/Orders.js
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/imageUrl";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return; // wait until user is loaded

    api
      .get(`/orders/user/${user.id}`)
      .then((res) => {
        console.log("✅ Orders API:", res.data);
        setOrders(res.data.data || res.data);
      })
      .catch((err) => {
        console.error("❌ Error fetching orders:", err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-pink-50 to-pink-100">
        <div className="text-5xl animate-bounce">🧁</div>
        <p className="mt-3 text-pink-600 font-semibold animate-pulse">
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f8] py-10 px-6 flex flex-col items-center pt-20">
      <h1 className="text-3xl font-bold text-center text-[#d77fa1] mb-8">
        🧁 Your Orders
      </h1>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center">
          No orders yet. Go grab a treat!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow-lg rounded-2xl p-6 border border-pink-100 hover:shadow-pink-200 transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg text-gray-700">
                  Order #{order.id}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    order.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : order.status === "processing"
                      ? "bg-yellow-100 text-yellow-600"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-1">
                Payment:{" "}
                <span
                  className={`font-medium ${
                    order.payment_status === "paid"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {order.payment_status}
                </span>
              </p>

              <p className="text-sm text-gray-500 mb-1">
                Method:{" "}
                <span className="font-medium">{order.payment_method}</span>
              </p>

              <p className="text-sm text-gray-500 mb-4">
                Fulfillment:{" "}
                <span className="font-medium">{order.fulfillment}</span>
              </p>

              {order.items?.length > 0 && (
                <div className="border-t pt-3">
                  <h3 className="font-semibold text-gray-700 mb-2">Items:</h3>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 mb-3"
                    >
                      {item.product_image && (
                        <img
                          src={getImageUrl(item.product_image)}
                          alt={item.product_name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {item.product_name} × {item.quantity}
                        </div>
                        <div className="text-xs text-gray-500">
                          ₱{Number(item.total_price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex justify-between items-center">
                <strong className="text-gray-700">Total:</strong>
                <span className="font-semibold text-[#d77fa1] text-lg">
                  ₱{Number(order.total).toFixed(2)}
                </span>
              </div>

              {order.pickup_time && (
                <p className="mt-2 text-xs text-gray-400">
                  Pickup Time: {new Date(order.pickup_time).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
