"use client";
// src/hooks/useAuth.ts
// Maa Flavours — Authentication hook
// Uses custom mf_session cookie via /api/auth/me — NOT Supabase auth session
// Use in any component: const { user, isLoggedIn, loading, logout } = useAuth()

import { useEffect, useState, useCallback } from "react";

export interface AuthUser {
  id: string;
  mobile: string;           // +91XXXXXXXXXX
  name: string;
  email: string | null;
  avatarInitial: string;    // first letter of name
  isNewUser: boolean;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (data.user) {
        const name = data.user.name || "";
        setUser({
          id: data.user.id,
          mobile: data.user.mobile || "",
          name,
          email: data.user.email || null,
          avatarInitial: name.charAt(0).toUpperCase() || "U",
          isNewUser: false,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch { /* ignore */ }
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoggedIn: !!user,
    loading,
    logout,
    refreshUser,
  };
}
