import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import GooeyNav from "./GooeyNav";
import {
  Home,
  ShoppingCart,
  ClipboardList,
  Bell,
  LogOut,
  Cake,
} from "lucide-react";
import api from "../api/api";
import { getImageUrl } from "../utils/imageUrl";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🧮 Total cart items
  const cartCount = useMemo(
    () => items.reduce((sum, it) => sum + (it.quantity || 0), 0),
    [items]
  );

  // 🧾 Total orders count
  const [orderCount, setOrderCount] = useState(0);

  // 🔔 Notification badge count
  const [notifCount, setNotifCount] = useState(0);

  // Fetch orders count
  useEffect(() => {
    if (!user?.id) return;
    api
      .get(`/orders/user/${user.id}`)
      .then((res) => {
        const orders = res.data.data || res.data;
        setOrderCount(orders.length);
      })
      .catch((err) => console.error("Error fetching orders:", err));
  }, [user]);

  // Fetch notifications count (unread)
  useEffect(() => {
    if (!user?.id) return;
    api
      .get(`/notifications/${user.id}`)
      .then((res) => {
        const notifications = res.data.data || res.data;
        const unread = notifications.filter((n) => !n.read_at).length;
        setNotifCount(unread);
      })
      .catch((err) => console.error("Error fetching notifications:", err));
  }, [user]);

  // 🚪 Logout handler
  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    navigate("/login");
  };

  if (!user) return null;

  // 🧭 Navigation links (centered Gooey)
  const navItems = [
    { label: "Home", href: "/", icon: <Home size={20} /> },
    { label: "Products", href: "/products", icon: <ShoppingCart size={20} /> },
    {
      label: `Checkout (${cartCount})`,
      href: "/checkout",
      icon: <ShoppingCart size={20} />,
    },
    {
      label: `Orders (${orderCount})`,
      href: "/orders",
      icon: <ClipboardList size={20} />,
    },
    {
      label: "",
      href: "/notifications",
      icon: (
        <div className="relative">
          <Bell size={20} />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-[5px]">
              {notifCount}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {/* 💻 Desktop Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-md hidden md:flex items-center justify-between px-6 py-3 rounded-b-3xl">
        {/* Left: Brand */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Sweet Bite Logo" className="w-12 h-12 mx-auto mb-2" />
          <span className="text-xl font-bold text-pink-600">Sweet Bites</span>
        </div>

        {/* Center: Gooey Navigation */}
        <div className="flex-1 flex justify-center">
          <div style={{ width: "fit-content" }}>
            <GooeyNav
              items={navItems}
              animationTime={500}
              particleCount={12}
              particleDistances={[60, 12]}
              particleR={80}
              timeVariance={200}
              colors={[1, 2, 3, 4]}
            />
          </div>
        </div>

        {/* Right: Profile Avatar + Logout */}
        <div className="flex items-center gap-3">
          {/* Profile Avatar */}
          <div className="relative group">
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full border-2 border-pink-400 overflow-hidden hover:scale-105 transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
              aria-label="Profile"
            >
              {user.image_url ? (
                <img
                  src={getImageUrl(user.image_url)}
                  alt={user.name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-pink-200 text-pink-700 font-semibold flex items-center justify-center text-lg">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Profile
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-pink-500 text-white px-3 py-1 rounded-full hover:bg-pink-600 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>

      {/* 📱 Mobile Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-pink-200 shadow-lg flex justify-around items-center py-2 z-50">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.href)}
            className={`relative flex flex-col items-center text-xs ${
              location.pathname === item.href
                ? "text-pink-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>

            {/* Mobile badge for notifications */}
            {item.href === "/notifications" && notifCount > 0 && (
              <span className="absolute top-0 right-3 bg-red-500 text-white text-[10px] font-bold rounded-full px-[5px]">
                {notifCount}
              </span>
            )}
          </button>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-xs text-gray-600 hover:text-pink-600"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}
