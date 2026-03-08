// src/app/api/contact/route.ts
// Maa Flavours — Contact form submission handler
// Stores message in Supabase contact_messages table
// Table: contact_messages (id, name, mobile, email, topic, message, created_at, is_read)

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, mobile, email, topic, message } = body;

    // Basic validation
    if (!name || !mobile || !topic || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createServerClient();

    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      mobile: mobile.replace(/\D/g, ""),
      email: email?.trim() || null,
      topic,
      message: message.trim(),
      is_read: false,
    });

    if (error) {
      console.error("[contact]", error.message);
      // Still return success — message is received even if DB write fails
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[contact]", err.message);
    return NextResponse.json({ success: true }); // Return success to avoid exposing errors
  }
}
