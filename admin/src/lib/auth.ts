import { useState, useEffect } from "react";
import { adminFetch } from "@/api/client";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  status: string;
}

export function getAdminToken(): string | null {
  return localStorage.getItem("yard_admin_token");
}

export function getStoredAdminUser(): AdminUser | null {
  const str = localStorage.getItem("yard_admin_user");
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function setAdminAuth(token: string, user: AdminUser) {
  localStorage.setItem("yard_admin_token", token);
  localStorage.setItem("yard_admin_user", JSON.stringify(user));
}

export function clearAdminAuth() {
  localStorage.removeItem("yard_admin_token");
  localStorage.removeItem("yard_admin_user");
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(() => getStoredAdminUser());
  const [token, setToken] = useState<string | null>(() => getAdminToken());

  useEffect(() => {
    const onStorage = () => {
      setUser(getStoredAdminUser());
      setToken(getAdminToken());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { user, token, isAuthenticated: Boolean(token && user?.role === "admin") };
}
