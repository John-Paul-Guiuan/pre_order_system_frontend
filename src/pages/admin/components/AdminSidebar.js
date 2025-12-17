import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiGrid, FiPackage, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import { useGooeyEffect } from "../../../components/GooeyNav";
import logo from "../../../assets/logo.png";

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const { collapsed: isCollapsed, toggle } = useSidebar();

  // Gooey effect for selected admin menu items (Dashboard, Products)
  const dashboardRef = useRef(null);
  const productsRef = useRef(null);
  const {
    containerRef,
    filterRef,
    textRef,
    moveToElement,
    triggerAtElement,
  } = useGooeyEffect();

  const handleHover = (ref, label) => {
    if (!ref.current) return;
    moveToElement(ref.current, label);
  };

  const handleClickGooey = (ref, label) => {
    if (!ref.current) return;
    triggerAtElement(ref.current, label);
  };

  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? "bg-white text-[#6B3E26]"
      : "text-white";

  return (
    <>
      {/* Sidebar */}
      <div
        ref={containerRef}
        className={`fixed top-0 left-0 h-screen bg-[#6B3E26] flex flex-col z-40 transition-all duration-300 ${
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        } w-64`}
      >
        {/* Sidebar header */}
        <div className="px-5 py-4 border-b border-[#8B5A3C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isCollapsed && (
              <h1 className="text-xl font-semibold text-white">Sweet Bite</h1>
            )}
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-5 py-8 min-h-0">
          <nav className="space-y-3">
            <Link
              ref={dashboardRef}
              to="/admin/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive(
                "/admin/dashboard"
              )}`}
              onMouseEnter={() => handleHover(dashboardRef, "Dashboard")}
              onClick={() => handleClickGooey(dashboardRef, "Dashboard")}
            >
              <FiGrid /> {!isCollapsed && <span>Dashboard</span>}
            </Link>

            <Link
              ref={productsRef}
              to="/admin/products"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive(
                "/admin/products"
              )}`}
              onMouseEnter={() => handleHover(productsRef, "Products")}
              onClick={() => handleClickGooey(productsRef, "Products")}
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

        {/* Gooey overlay elements (shared with GooeyNav) */}
        <span className="effect filter" ref={filterRef}></span>
        <span className="effect text" ref={textRef}></span>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggle}
        />
      )}
    </>
  );
}
