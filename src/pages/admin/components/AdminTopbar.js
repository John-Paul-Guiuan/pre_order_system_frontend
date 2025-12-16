import React from "react";
import { FiBell, FiUser } from "react-icons/fi";
import logo from "../../../assets/logo.png";

export default function AdminTopbar() {
  return (
    <div className="bg-[#FCE8E4] shadow border-b flex-shrink-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
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
