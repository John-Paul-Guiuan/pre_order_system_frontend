import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Central function to set user everywhere (state + localStorage)
  const updateUser = (updatedUser) => {
    if (!updatedUser) return;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUserState(updatedUser);
  };

  // -------------------------------------------------------
  //  LOAD USER FROM STORAGE ON APP START
  // -------------------------------------------------------
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // validate JSON
        const parsedUser = JSON.parse(storedUser);
        setUserState(parsedUser);
      }
    } catch (err) {
      console.warn("Corrupted localStorage user:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }

    setLoading(false);
  }, []);

  // -------------------------------------------------------
  //  LOGIN
  // -------------------------------------------------------
  async function login(email, password) {
    const response = await api.post("/login", { email, password });

    const { user, token } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // 🔥 Update global user immediately
    setUserState(user);

    return user;
  }

  // -------------------------------------------------------
  //  LOGOUT
  // -------------------------------------------------------
  async function logout() {
    try {
      await api.post("/logout");
    } catch (err) {
      console.warn("Logout API failed:", err.message);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      setUserState(null);
    }
  }

  // -------------------------------------------------------
  //  PUBLIC CONTEXT VALUE
  // -------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser,  // 🔥 always use updateUser (sync everywhere)
        login,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
