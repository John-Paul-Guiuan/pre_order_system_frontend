import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiGrid, FiPackage, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? "bg-white text-brown-700 shadow-md"
      : "text-white";

  return (
    <div className="h-screen w-64 bg-[#6B3E26] flex flex-col justify-between py-6 px-4 fixed">
      <div>
        <div className="mb-10 text-center">
          <img
            src="/sweetbite-logo.png"
            className="w-20 mx-auto"
            alt="Sweet Bite"
          />
          <h1 className="text-xl font-semibold text-white mt-3">Sweet Bite</h1>
        </div>

        <nav className="space-y-2">
          <Link
            to="/admin/dashboard"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium ${isActive(
              "/admin/dashboard"
            )}`}
          >
            <FiGrid /> Dashboard
          </Link>

          <Link
            to="/admin/products"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium ${isActive(
              "/admin/products"
            )}`}
          >
            <FiPackage /> Products
          </Link>
        </nav>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-3 bg-[#D48A32] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#bf7729] transition"
      >
        Logout <FiLogOut />
      </button>
    </div>
  );
}
