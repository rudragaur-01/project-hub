import { createContext, useContext, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext();

function getStoredAuth() {
  const storedToken = localStorage.getItem("pm_token");
  const storedUser = localStorage.getItem("pm_user");
  if (storedToken && storedUser) {
    try {
      return { token: storedToken, user: JSON.parse(storedUser) };
    } catch {
      return { token: null, user: null };
    }
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredAuth().user);
  const [token, setToken] = useState(() => getStoredAuth().token);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!token;

  const login = async (email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("pm_token", data.token);
      localStorage.setItem("pm_refresh_token", data.refreshToken);
      localStorage.setItem("pm_user", JSON.stringify(data.user));
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", { name, email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("pm_token", data.token);
      localStorage.setItem("pm_refresh_token", data.refreshToken);
      localStorage.setItem("pm_user", JSON.stringify(data.user));
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setError(null);
    setUser(null);
    setToken(null);
    localStorage.removeItem("pm_token");
    localStorage.removeItem("pm_refresh_token");
    localStorage.removeItem("pm_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isLoading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
