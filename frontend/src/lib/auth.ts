import { useEffect, useState } from "react";
import { authApi, RegisterPayload, LoginPayload } from "@/api/auth";
import { setAuthToken, getAuthToken } from "@/api/client";
import { Role } from "@/api/types";

export interface AuthUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  organizationId?: string;
  creatorId?: string;
  avatar?: string;
  company?: string;
  location?: string;
  approved?: boolean;
  verified?: boolean;
}

const authListeners = new Set<() => void>();
const notify = () => authListeners.forEach((fn) => fn());

let cachedUser: AuthUser | null = null;
let hasHydrated = false;

export const hydrateFromSession = async () => {
  const token = getAuthToken();
  if (!token) {
    cachedUser = null;
    hasHydrated = true;
    notify();
    return;
  }

  try {
    const me = await authApi.getMe();
    cachedUser = {
      id: me.id,
      role: me.role,
      name: me.email.split("@")[0],
      email: me.email,
      organizationId: me.organizationId,
      creatorId: me.creatorId,
      verified: true,
      approved: true,
    };
  } catch {
    cachedUser = null;
    setAuthToken(null);
  } finally {
    hasHydrated = true;
    notify();
  }
};

// Initial hydrate
hydrateFromSession();

export const getCurrentUser = (): AuthUser | null => cachedUser;

export const signInWithPassword = async (email: string, password: string = "Password123!") => {
  const res = await authApi.login({ email, password });
  if (res.user) {
    cachedUser = {
      id: res.user.id,
      role: res.user.role,
      name: res.user.email.split("@")[0],
      email: res.user.email,
      organizationId: res.user.organizationId,
      creatorId: res.user.creatorId,
      verified: true,
      approved: true,
    };
    hasHydrated = true;
    notify();
  }
  return res;
};

export interface CreatorSignupData {
  role: "creator";
  full_name: string;
  email: string;
  password?: string;
  phone?: string;
  country?: string;
  niche?: string;
  audience_size?: number;
  socials?: Record<string, string>;
  portfolio_links?: string[];
  payout_method?: string;
  bio?: string;
  avatar_url?: string;
}

export interface BrandSignupData {
  role: "brand";
  full_name?: string;
  email: string;
  password?: string;
  business_name: string;
  contact_person?: string;
  phone?: string;
  website?: string;
  business_category?: string;
  company_size?: string;
  budget_range?: string;
  country?: string;
  logo_url?: string;
  description?: string;
}

export const signUpWithPassword = async (input: CreatorSignupData | BrandSignupData) => {
  const name = (input as any).business_name || (input as any).full_name || input.email.split("@")[0];
  const res = await authApi.register({
    email: input.email,
    password: input.password || "Password123!",
    role: input.role,
    name,
  });

  if (res.user) {
    cachedUser = {
      id: res.user.id,
      role: res.user.role,
      name: res.user.email.split("@")[0],
      email: res.user.email,
      organizationId: res.user.organizationId,
      creatorId: res.user.creatorId,
      verified: true,
      approved: true,
    };
    hasHydrated = true;
    notify();
  }
  return res;
};

export const signOut = async () => {
  authApi.logout();
  cachedUser = null;
  hasHydrated = true;
  notify();
};

export const requestPasswordReset = async (email: string) => {
  // Password reset request
  return true;
};

export const updatePassword = async (password: string) => {
  return true;
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(() => cachedUser);
  const [ready, setReady] = useState(hasHydrated);
  useEffect(() => {
    const fn = () => {
      setUser(cachedUser);
      setReady(hasHydrated);
    };
    authListeners.add(fn);
    fn();
    return () => {
      authListeners.delete(fn);
    };
  }, []);

  (useAuth as any).ready = ready;
  return user;
};

export const useAuthReady = () => {
  const [ready, setReady] = useState(hasHydrated);
  useEffect(() => {
    const fn = () => setReady(hasHydrated);
    authListeners.add(fn);
    return () => {
      authListeners.delete(fn);
    };
  }, []);
  return ready;
};

export const useIsAdmin = () => {
  const user = useAuth();
  return user?.role === "admin";
};

export const dashboardPathFor = (role: Role) =>
  role === "brand" ? "/brand" : role === "creator" ? "/creator" : "/founders/console";
