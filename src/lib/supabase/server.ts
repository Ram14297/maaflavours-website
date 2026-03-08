// src/lib/supabase/server.ts
// Maa Flavours — Supabase server-side client
// Used in Server Components, API Routes, and Server Actions

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from Server Component — cookies can't be set
            // Middleware handles session refresh
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Server Component context — handled by middleware
          }
        },
      },
    }
  );
}

/**
 * Service role client — bypasses RLS, use only in trusted server contexts
 * NEVER expose service role key to browser
 */
export function createAdminSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Convenience aliases used by API routes
export const createAdminClient = createAdminSupabaseClient;
export const createServerClient = createServerSupabaseClient;
