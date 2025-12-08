import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout({ children }) {
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-pink-600 mb-10">
          Admin Panel
        </h1>

        <nav className="flex flex-col gap-3">
          <Link
            to="/admin/dashboard"
            className="p-3 rounded-lg hover:bg-pink-100 transition"
          >
            📊 Dashboard
          </Link>

          <Link
            to="/admin/products"
            className="p-3 rounded-lg hover:bg-pink-100 transition"
          >
            🧁 Products
          </Link>
        </nav>

        <div className="mt-auto">
          <button
            onClick={logout}
            className="w-full bg-pink-500 text-white p-2 rounded-lg mt-4 hover:bg-pink-600 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-xl font-bold text-gray-700 mb-6">
          Welcome, {user?.name}
        </h2>
        {children}
      </main>
    </div>
  );
}
