import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function restoreSession() {
      try {
        const data = await apiFetch("/auth/me", { token });
        if (!cancelled) {
          setUser(data.user);
        }
      } catch (_error) {
        if (!cancelled) {
          setToken("");
          setUser(null);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAdmin: user?.role === "admin",
      isAuthenticated: Boolean(token && user),
      async login(email, password) {
        setLoading(true);
        try {
          const data = await apiFetch("/auth/login", {
            method: "POST",
            body: { email: String(email || "").trim().toLowerCase(), password }
          });
          setToken(data.token);
          setUser(data.user);
          return data;
        } finally {
          setLoading(false);
        }
      },
      async register(name, email, password) {
        setLoading(true);
        try {
          const data = await apiFetch("/auth/register", {
            method: "POST",
            body: { name, email: String(email || "").trim().toLowerCase(), password }
          });
          setToken(data.token);
          setUser(data.user);
          return data;
        } finally {
          setLoading(false);
        }
      },
      logout() {
        setToken("");
        setUser(null);
      },
      async forgotPassword(email) {
        setLoading(true);
        try {
          return await apiFetch("/auth/forgot-password", {
            method: "POST",
            body: { email: String(email || "").trim().toLowerCase() }
          });
        } finally {
          setLoading(false);
        }
      },
      async verifyResetCode(email, code) {
        setLoading(true);
        try {
          return await apiFetch("/auth/verify-reset-code", {
            method: "POST",
            body: { email: String(email || "").trim().toLowerCase(), code }
          });
        } finally {
          setLoading(false);
        }
      },
      async resetPassword(email, code, password) {
        setLoading(true);
        try {
          return await apiFetch("/auth/reset-password", {
            method: "POST",
            body: { email: String(email || "").trim().toLowerCase(), code, password }
          });
        } finally {
          setLoading(false);
        }
      }
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
