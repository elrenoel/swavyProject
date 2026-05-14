import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";

const AuthContext = createContext({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch("/auth/me");
      setUser(data.user || null);
    } catch (error) {
      try {
        await apiFetch("/auth/refresh", { method: "POST" });
        const data = await apiFetch("/auth/me");
        setUser(data.user || null);
      } catch (refreshError) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshUser();
      }
    };

    window.addEventListener("focus", refreshUser);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", refreshUser);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, refreshUser, logout }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
