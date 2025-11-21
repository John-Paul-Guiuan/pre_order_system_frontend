import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user from localStorage on start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ✅ Login function
  async function login(email, password) {
    const response = await api.post("/login", { email, password });
    const { user, token } = response.data;

    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    // Set axios header and update React state immediately
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user); // 🔥 triggers UI re-render right away
  }

  // ✅ Improved Logout function (always clears state)
  async function logout() {
    try {
      await api.post("/logout");
    } catch (err) {
      console.warn("Logout API failed:", err.message);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    }
  }

  // ✅ Update user function to sync with localStorage
  const updateUser = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser: updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
