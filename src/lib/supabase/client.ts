// src/lib/supabase/client.ts
// Maa Flavours — Supabase browser-side client
// Used in React components for data fetching

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Named re-export used by hooks
export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
