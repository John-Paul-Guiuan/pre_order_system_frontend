import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------
  //  ROLE NORMALIZER (ENSURES consistent customer/admin)
  // -------------------------------------------------------
  const normalizeUser = (rawUser) => {
    if (!rawUser) return null;
    const rawRole =
      rawUser.role ||
      rawUser.user_role ||
      rawUser.role_name ||
      rawUser.userType ||
      "";
    const normalizedRole = (rawRole || "").toLowerCase() === "admin" ? "admin" : "customer";
    return { ...rawUser, role: normalizedRole };
  };

  // -------------------------------------------------------
  //  SAFE USER SETTER (SYNC LOCALSTORAGE + STATE)
  // -------------------------------------------------------
  const updateUser = (updatedUser) => {
    const normalized = normalizeUser(updatedUser);
    if (!normalized) return;
    localStorage.setItem("user", JSON.stringify(normalized));
    setUser(normalized); // 🔥 triggers UI re-render instantly
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
            const freshUser = normalizeUser(res.data.user || res.data);
            if (freshUser) {
              updateUser(freshUser);
            } else {
              throw new Error("Invalid user payload");
            }
          } catch (err) {
            // If backend is down (500) keep the cached user so the UI can still render
            const parsedUser = normalizeUser(JSON.parse(storedUser));
            const status = err?.response?.status;
            console.warn("Token validation failed:", status, err?.message);

            if (status === 401) {
              // Invalid token — clear session
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              delete api.defaults.headers.common["Authorization"];
              setUser(null);
            } else {
              // Keep cached user for non-auth errors (e.g., 500)
              setUser(parsedUser);
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

    const userData = normalizeUser(response.data.user || response.data.data);
    const token = response.data.token;

    console.log("Login response:", {
      user: userData,
      token: token,
      role: userData?.role,
    });

    if (!userData || !token) {
      throw new Error("Invalid login response: missing user or token");
    }

    // Ensure role is present
    if (!userData?.role) {
      console.warn("⚠️ Warning: User role not provided in login response");
    }

    // Store in localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    // Update state
    setUser(userData);

    console.log("✅ Login successful. User role:", userData.role);
    return userData;
  }

  // -------------------------------------------------------
  //  LOGOUT
  // -------------------------------------------------------
  async function logout() {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Logout API call failed:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      console.log("✅ Logged out successfully");
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
