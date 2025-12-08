// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import AdminTopbar from "./components/AdminTopbar";

/**
 * Admin Dashboard Overview
 * - Fetches products and computes totals, available/unavailable, recent additions
 * - Polls every 5s to keep UI fresh (can be reduced/increased)
 * - Uses existing /products endpoint (paginated). We request many items (per_page=100)
 * - Includes search and quick "Refresh" button
 */

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // redirect if not admin (basic client guard)
  useEffect(() => {
    if (!user) return; // let auth load first
    if (user.role !== "admin") {
      // redirect non-admins away
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [perPage] = useState(50); // fetch up to 50 latest products for dashboard
  const [page, setPage] = useState(1);

  const fetchProducts = async (opts = {}) => {
    setError(null);
    try {
      const params = {
        page: opts.page || page,
        per_page: opts.per_page || perPage,
      };
      if (opts.search || search) params.search = opts.search || search;
      const res = await api.get("/products", { params });
      // API returns paginated object or array -- handle both
      const data = res.data?.data ? res.data.data : res.data;
      // Make sure array
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Admin Dashboard: fetch products error", err);
      setError("Failed to load products");
      setLoading(false);
    }
  };

  // initial load + polling
  useEffect(() => {
    setLoading(true);
    fetchProducts({ page: 1 });

    const interval = setInterval(() => {
      fetchProducts({ page: 1 });
    }, 5000); // poll every 5 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // live computed stats
  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.is_available || p.is_available === 1).length;
    const unavailable = total - available;
    // sort by created_at desc for recent
    const recent = [...products]
      .sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0))
      .slice(0, 6);
    return { total, available, unavailable, recent };
  }, [products]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetchProducts({ page: 1, search });
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 w-full bg-[#E6E6E6] min-h-screen">
        <AdminTopbar />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of products and recent activity</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchProducts({ page: 1 })}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md"
            >
              Refresh
            </button>
            <button
              onClick={() => navigate("/admin/products")}
              className="px-4 py-2 border rounded-md"
            >
              Manage Products
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Products</div>
            <div className="text-2xl font-semibold text-gray-800">{stats.total}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Available</div>
            <div className="text-2xl font-semibold text-green-600">{stats.available}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Unavailable</div>
            <div className="text-2xl font-semibold text-red-500">{stats.unavailable}</div>
          </div>
        </div>

        {/* Search + Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <form onSubmit={handleSearch} className="lg:col-span-2 flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 border rounded-lg"
            />
            <button className="px-4 bg-pink-500 text-white rounded-lg">Search</button>
          </form>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Recent Products</h3>
              <span className="text-xs text-gray-400">Latest</span>
            </div>
            <ul>
              {stats.recent.length === 0 && <li className="text-sm text-gray-500">No recent products</li>}
              {stats.recent.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                  <img src={p.image_url || "/placeholder.png"} alt={p.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.category?.name || "—"}</div>
                  </div>
                  <div className="text-sm font-semibold text-pink-600">₱{Number(p.base_price).toFixed(2)}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    Loading products...
                  </td>
                </tr>
              )}

              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}

              {!loading &&
                products.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <img src={p.image_url || "/placeholder.png"} alt={p.name} className="w-12 h-12 rounded object-cover" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.created_at ? new Date(p.created_at).toLocaleString() : ""}</div>
                    </td>
                    <td className="px-4 py-3">{p.category?.name || "-"}</td>
                    <td className="px-4 py-3 text-right">₱{Number(p.base_price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      {p.is_available ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Available</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Error message */}
        {error && <div className="mt-4 text-red-500">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
