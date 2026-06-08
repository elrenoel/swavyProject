import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";
import { getMyProfile } from "../services/profile";

const AuthContext = createContext({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch("/auth/me");
      setUser(data.user || null);
      try {
        const currentProfile = await getMyProfile();
        setProfile(currentProfile);
      } catch (profileError) {
        setProfile(null);
      }
    } catch (error) {
      try {
        await apiFetch("/auth/refresh", { method: "POST" });
        const data = await apiFetch("/auth/me");
        setUser(data.user || null);
        try {
          const currentProfile = await getMyProfile();
          setProfile(currentProfile);
        } catch (profileError) {
          setProfile(null);
        }
      } catch (refreshError) {
        setUser(null);
        setProfile(null);
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
      setProfile(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const value = useMemo(
    () => ({ user, profile, isLoading, refreshUser, logout }),
    [user, profile, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
