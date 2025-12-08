import React from "react";
import { FiBell, FiSettings, FiUser } from "react-icons/fi";

export default function AdminTopbar() {
  return (
    <div className="bg-white shadow-sm mb-6">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/sweetbite-logo.png"
            className="w-10 h-10"
            alt="Sweet Bite"
          />
          <h1 className="text-xl font-semibold text-[#5A381E]">Sweet Bite</h1>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-6 text-2xl text-gray-600">
          <FiBell className="cursor-pointer hover:text-[#B3611B] transition" />
          <FiUser className="cursor-pointer hover:text-[#B3611B] transition" />
        </div>
      </div>
    </div>
  );
}

