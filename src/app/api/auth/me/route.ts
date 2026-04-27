// src/app/api/auth/me/route.ts
// Maa Flavours — Get current logged-in user
// GET /api/auth/me
// Reads mf_session cookie → looks up customer in Supabase → returns real user data

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { verifyCustomerSession } from "@/lib/customer-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await verifyCustomerSession(request);
    if (!session) return NextResponse.json({ user: null });

    const supabase = createAdminSupabaseClient();

    // Try to look up by ID first
    if (session.userId) {
      const { data: customer } = await supabase
        .from("customers")
        .select("id, name, email, mobile")
        .eq("id", session.userId)
        .maybeSingle();

      if (customer) {
        // Strip placeholder mobile (set by auto-create in addresses route)
        const realMobile = customer.mobile?.startsWith("_ph_") ? null : customer.mobile;
        return NextResponse.json({
          user: {
            id: customer.id,
            mobile: realMobile,
            name: customer.name || session.name || "",
            email: customer.email || null,
          },
        });
      }
    }

    // Fallback: look up by email (email-OTP accounts)
    if (session.email) {
      const { data: customer } = await supabase
        .from("customers")
        .select("id, name, email, mobile")
        .eq("email", session.email)
        .maybeSingle();

      if (customer) {
        const realMobile = customer.mobile?.startsWith("_ph_") ? null : customer.mobile;
        return NextResponse.json({
          user: {
            id: customer.id,
            mobile: realMobile,
            name: customer.name || session.name || "",
            email: customer.email || null,
          },
        });
      }
    }

    // Fallback: look up by mobile (legacy SMS-OTP accounts)
    if (session.mobile) {
      const { data: customer } = await supabase
        .from("customers")
        .select("id, name, email, mobile")
        .eq("mobile", session.mobile)
        .maybeSingle();

      if (customer) {
        const realMobile = customer.mobile?.startsWith("_ph_") ? null : customer.mobile;
        return NextResponse.json({
          user: {
            id: customer.id,
            mobile: realMobile,
            name: customer.name || session.name || "",
            email: customer.email || null,
          },
        });
      }
    }

    // No DB record found — return cookie data so UI still works
    if (session.name && (session.email || session.mobile)) {
      return NextResponse.json({
        user: {
          id: session.userId || "",
          mobile: session.mobile || null,
          name: session.name,
          email: session.email || null,
        },
      });
    }

    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
