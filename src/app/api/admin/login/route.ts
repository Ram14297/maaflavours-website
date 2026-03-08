// src/app/api/admin/login/route.ts
// Maa Flavours — Admin Login API
// POST /api/admin/login
// Body: { email: string, password: string }
// Returns: { success: true, admin: { email, role } }
// Sets httpOnly cookie: mf-admin-token (JWT, 24h)

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { signAdminToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_OPTIONS } from "@/lib/admin-auth";

// Rate limiting: in-memory map (use Redis/Upstash in production for multi-instance)
const FAILED_ATTEMPTS = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS    = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const clientIp = req.headers.get("x-forwarded-for") || "unknown";

    // ─── Rate limiting ───────────────────────────────────────────────
    const rateKey  = `${clientIp}:${email}`;
    const attempts = FAILED_ATTEMPTS.get(rateKey);
    if (attempts && attempts.lockedUntil > Date.now()) {
      const minutes = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${minutes} minute(s).` },
        { status: 429 }
      );
    }

    // ─── Look up admin in DB ─────────────────────────────────────────
    let adminUser: { id: string; email: string; password_hash: string; role: string } | null = null;

    try {
      const supabase = createAdminSupabaseClient();
      const { data } = await supabase
        .from("admin_users")
        .select("id, email, password_hash, role, is_active")
        .eq("email", email.toLowerCase().trim())
        .eq("is_active", true)
        .single();
      adminUser = data;
    } catch {
      // Fallback: check env vars (for local dev without DB)
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminHash  = process.env.ADMIN_PASSWORD_HASH;
      if (adminEmail && adminHash && email === adminEmail) {
        adminUser = { id: "admin-dev", email: adminEmail, password_hash: adminHash, role: "super_admin" };
      }
    }

    if (!adminUser) {
      // Track failed attempt
      const cur = FAILED_ATTEMPTS.get(rateKey) || { count: 0, lockedUntil: 0 };
      cur.count++;
      if (cur.count >= MAX_ATTEMPTS) cur.lockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
      FAILED_ATTEMPTS.set(rateKey, cur);
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // ─── Verify password ─────────────────────────────────────────────
    const passwordValid = await bcrypt.compare(password, adminUser.password_hash);
    if (!passwordValid) {
      const cur = FAILED_ATTEMPTS.get(rateKey) || { count: 0, lockedUntil: 0 };
      cur.count++;
      if (cur.count >= MAX_ATTEMPTS) cur.lockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
      FAILED_ATTEMPTS.set(rateKey, cur);
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // ─── Clear failed attempts on success ────────────────────────────
    FAILED_ATTEMPTS.delete(rateKey);

    // ─── Update last_login_at ────────────────────────────────────────
    try {
      const supabase = createAdminSupabaseClient();
      await supabase
        .from("admin_users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", adminUser.id);
    } catch { /* non-fatal */ }

    // ─── Sign JWT and set cookie ─────────────────────────────────────
    const token = await signAdminToken({
      email:   adminUser.email,
      role:    adminUser.role,
      adminId: adminUser.id,
    });

    const res = NextResponse.json({
      success: true,
      admin: { email: adminUser.email, role: adminUser.role },
    });

    res.cookies.set(ADMIN_COOKIE_NAME, token, ADMIN_COOKIE_OPTIONS);
    return res;

  } catch (err: any) {
    console.error("[admin/login]", err.message);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
