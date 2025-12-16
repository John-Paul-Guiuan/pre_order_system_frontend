import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiGrid, FiPackage, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import logo from "../../../assets/logo.png";

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const { collapsed: isCollapsed, toggle } = useSidebar();

  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? "bg-white text-[#6B3E26]"
      : "text-white";

  const toggleSidebar = () => {
    toggle();
  };

  return (
    <>
      {/* Hamburger Button - Fixed position */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-[#6B3E26] text-white p-2 rounded-lg shadow-lg hover:bg-[#5A2F1B] transition lg:hidden"
        aria-label="Toggle sidebar"
      >
        {isCollapsed ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-[#6B3E26] flex flex-col z-40 transition-all duration-300 ${
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        } ${isCollapsed ? "w-16" : "w-64"}`}
      >
        {/* Hamburger Button - Inside sidebar for desktop */}
        <div className="px-5 py-4 border-b border-[#8B5A3C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Sweet Bite Logo" className="w-12 h-12 mx-auto mb-2" />
            {!isCollapsed && (
              <h1 className="text-xl font-semibold text-white">Sweet Bite</h1>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-[#D48A32] transition lg:block hidden"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <FiMenu className="text-xl" /> : <FiX className="text-xl" />}
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-5 py-8 min-h-0">
          <nav className="space-y-3">
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive(
                "/admin/dashboard"
              )}`}
            >
              <FiGrid /> {!isCollapsed && <span>Dashboard</span>}
            </Link>

            <Link
              to="/admin/products"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive(
                "/admin/products"
              )}`}
            >
              <FiPackage /> {!isCollapsed && <span>Products</span>}
            </Link>
          </nav>
        </div>

        {/* LOGOUT – ALWAYS VISIBLE AT BOTTOM */}
        <div className="px-5 py-4 border-t border-[#8B5A3C] flex-shrink-0">
          <button
            onClick={logout}
            className={`w-full flex items-center justify-center gap-3 bg-[#D48A32] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#bf7729] transition ${
              isCollapsed ? "px-3" : "px-4"
            }`}
          >
            <FiLogOut />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
