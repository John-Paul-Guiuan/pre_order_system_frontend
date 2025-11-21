import React, { useState, useEffect, useRef } from "react";
import axios from "../api/api";
import toast from "react-hot-toast";

export default function Profile() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const fileInputRef = useRef(null);

  // 🧠 Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { name, phone, address, image_url } = res.data.user || res.data;
        setForm({ name, phone, address, image: null });
        setPreview(image_url || null);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // 📋 Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageClick = () => fileInputRef.current?.click();

  // 💾 Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name.trim()) {
      toast.error("Name is required");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("address", form.address);
      if (form.image) formData.append("image", form.image);

      const res = await axios.put(
        "http://127.0.0.1:8000/api/profile/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      toast.success("✅ Profile updated successfully!");
      console.log("Updated profile:", res.data);
    } catch (error) {
      console.error("Full error response:", error.response);
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat().join(", ");
        toast.error(errors);
      } else {
        toast.error("Something went wrong updating profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Password logic
  const handlePasswordChange = (e) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://127.0.0.1:8000/api/profile/change-password",
        {
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }
      );
      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 py-10 px-4 flex justify-center items-center">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-2xl border border-pink-100 relative">
        {/* Header */}
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-pink-400 via-rose-300 to-orange-300"></div>
        <h1 className="text-4xl font-extrabold text-pink-600 text-center mb-6 drop-shadow-sm">
          My Sweet Profile 🍰
        </h1>

        {/* Profile Picture */}
        <div className="flex justify-center mb-8">
          <div
            onClick={handleImageClick}
            className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-pink-300 shadow-md cursor-pointer group"
          >
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl text-pink-300 group-hover:text-pink-500 transition-all duration-300">
                👤
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex justify-center items-center text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
              📷 Change
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            name="image"
            onChange={handleChange}
            className="hidden"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-400 outline-none shadow-sm"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-400 outline-none shadow-sm"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-400 outline-none shadow-sm resize-none"
              placeholder="Enter your address"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl py-2.5 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>

        {/* Password Button */}
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full mt-4 border-2 border-pink-300 text-pink-600 rounded-xl py-2 font-semibold hover:bg-pink-50 transition-all duration-300"
        >
          Change Password
        </button>

        <p className="text-center text-gray-500 text-sm mt-6 italic">
          “Freshly baked updates — made with love 💖”
        </p>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-pink-600 text-center mb-4">
              Change Password 🔒
            </h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <input
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                placeholder="Current password"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
                required
              />
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="New password"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
                required
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-600 rounded-xl py-2 font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl py-2 font-semibold hover:shadow-md transform hover:scale-[1.02] transition-all"
                >
                  {passwordLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
