import React from "react";
import { FiBell, FiMenu, FiX } from "react-icons/fi";
import logo from "../../../assets/logo.png";

export default function AdminTopbar({ toggleSidebar, isSidebarOpen }) {
  return (
    <div className="bg-[#FCE8E4] shadow border-b flex-shrink-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="mr-2 text-[#5A381E] hover:text-[#B3611B] transition"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
          <img src={logo} alt="Sweet Bite Logo" className="w-12 h-12 mx-auto mb-2" />
          <h1 className="text-xl font-semibold text-[#5A381E]">
            Sweet Bite
          </h1>
        </div>

        <div className="flex items-center gap-6 text-2xl text-[#5A381E]">
          <FiBell className="cursor-pointer hover:text-[#B3611B]" />
        </div>
      </div>
    </div>
  );
}
