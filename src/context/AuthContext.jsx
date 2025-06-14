"use client";
import api, { removeAllCookies } from "@/axios";
import Loader from "@/components/Loader";
import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Important: We are using this user as a session in out app
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (username, password) => {
    console.log("Login called");
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("accessToken", res.data.accessToken);
      await getUser();
      return res;
    } catch (error) {
      return error;
    }
  };

  const logout = async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
    setUser(null);
    removeAllCookies();
    if (typeof window !== "undefined") window.location.href = "/sign-in";
  };

  const getUser = async () => {
    setLoading(true);
    // Check for token in local storage
    const token = localStorage.getItem("accessToken");
    console.log("Token while getting user", token);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/auth/me"); // You should create this endpoint
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (loading) {
    return <Loader fullScreen={true} />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
