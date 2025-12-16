import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static z-40 h-full
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"}
          bg-[#6B3E26]
        `}
      >
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <AdminTopbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 bg-[#F7F3EF]">
          {children}
        </main>
      </div>
    </div>
  );
}
