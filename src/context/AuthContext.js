import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------
  //  SAFE USER SETTER (SYNC LOCALSTORAGE + STATE)
  // -------------------------------------------------------
  const updateUser = (updatedUser) => {
    if (!updatedUser) return;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUserState(updatedUser); // 🔥 triggers UI re-render instantly
  };

  // -------------------------------------------------------
  //  LOAD USER + TOKEN ON APP START
  // -------------------------------------------------------
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Validate token against backend to avoid stale sessions
          try {
            const res = await api.get("/user");
            const freshUser = res.data.user || res.data;
            if (freshUser) {
              updateUser(freshUser);
            } else {
              throw new Error("Invalid user payload");
            }
          } catch (err) {
            // If backend is down (500) keep the cached user so the UI can still render
            const parsedUser = JSON.parse(storedUser);
            const status = err?.response?.status;
            console.warn("Token validation failed:", status, err?.message);

            if (status === 401) {
              // Invalid token — clear session
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              delete api.defaults.headers.common["Authorization"];
              setUserState(null);
            } else {
              // Keep cached user for non-auth errors (e.g., 500)
              setUserState(parsedUser);
            }
          }
        }
      } catch (err) {
        console.warn("🚨 Corrupted localStorage user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  // -------------------------------------------------------
  //  LOGIN (NOW FETCHES FRESH USER DATA)
  // -------------------------------------------------------
  async function login(email, password) {
    const response = await api.post("/login", { email, password });

    const { user, token } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
      // Even if API fails, clear local state
      console.warn("Logout API failed:", err.message);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      setUserState(null);

      // Redirect to login page
      window.location.href = "/login";
    }
  }

  // -------------------------------------------------------
  //  REFRESH USER DATA FROM BACKEND
  //  (Used after updating profile)
  // -------------------------------------------------------
  async function refreshUser() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      updateUser(response.data.user || response.data);
    } catch (err) {
      console.warn("Failed to refresh user:", err);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser, // 🔥 used by Profile.js
        login,
        logout,
        refreshUser, // 🔥 call this after saving profile
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
