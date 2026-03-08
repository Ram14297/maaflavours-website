"use client";
// src/hooks/useAuth.ts
// Maa Flavours — Authentication hook
// Reads Supabase session, provides user data + logout utility
// Use in any component: const { user, isLoggedIn, logout } = useAuth()

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

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

// ─── Convert Supabase User → AuthUser ────────────────────────────────────
function toAuthUser(supabaseUser: User, profile?: Record<string, any>): AuthUser {
  const mobile = supabaseUser.phone || profile?.mobile || "";
  const name = profile?.full_name || supabaseUser.user_metadata?.full_name || "Customer";
  return {
    id: supabaseUser.id,
    mobile,
    name,
    email: profile?.email || supabaseUser.email || null,
    avatarInitial: name.charAt(0).toUpperCase() || "C",
    isNewUser: profile?.is_new_user ?? false,
  };
}

export function useAuth(): UseAuthReturn {
  const supabase = createBrowserClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Fetch profile from customers table ─────────────────────────────
  const fetchProfile = useCallback(async (supabaseUser: User) => {
    try {
      const { data: profile } = await supabase
        .from("customers")
        .select("full_name, email, mobile, is_new_user")
        .eq("id", supabaseUser.id)
        .single();

      setUser(toAuthUser(supabaseUser, profile || {}));
    } catch {
      // Customers table may not exist yet — fall back to user metadata
      setUser(toAuthUser(supabaseUser));
    }
  }, [supabase]);

  // ─── Initial session check ────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          await fetchProfile(session.user);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    // ─── Listen for auth state changes ─────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await fetchProfile(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    // Clear any cached data
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchProfile(session.user);
    }
  }, [fetchProfile, supabase]);

  return {
    user,
    isLoggedIn: !!user,
    loading,
    logout,
    refreshUser,
  };
}
