// src/app/api/pincode/route.ts
// Maa Flavours — Pincode Lookup API
// GET /api/pincode?pin=523001
// Calls India Post API to get city and state from pincode
// Used at checkout and in address forms for auto-fill

import { NextRequest, NextResponse } from "next/server";

// In-memory cache to avoid redundant calls to India Post API
const CACHE = new Map<string, { city: string; state: string } | null>();

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get("pin");

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Invalid pincode format" }, { status: 400 });
  }

  // Check cache
  if (CACHE.has(pincode)) {
    const cached = CACHE.get(pincode);
    if (!cached) return NextResponse.json({ error: "No postal offices found for this pincode" }, { status: 404 });
    return NextResponse.json(cached);
  }

  try {
    const res  = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      next: { revalidate: 86400 },  // Cache for 24 hours
    });
    const data = await res.json();

    if (!data || !data[0] || data[0].Status !== "Success") {
      CACHE.set(pincode, null);
      return NextResponse.json({ error: "Pincode not found" }, { status: 404 });
    }

    const office = data[0].PostOffice?.[0];
    if (!office) {
      CACHE.set(pincode, null);
      return NextResponse.json({ error: "No postal offices found for this pincode" }, { status: 404 });
    }

    const result = {
      city:     office.District || office.Name,
      state:    office.State,
      district: office.District,
    };

    CACHE.set(pincode, result);
    return NextResponse.json(result);

  } catch (err: any) {
    // Fallback: known Andhra/Telangana pincodes
    const KNOWN: Record<string, { city: string; state: string }> = {
      "523001": { city: "Ongole",     state: "Andhra Pradesh" },
      "523002": { city: "Ongole",     state: "Andhra Pradesh" },
      "500001": { city: "Hyderabad",  state: "Telangana"       },
      "600001": { city: "Chennai",    state: "Tamil Nadu"       },
      "560001": { city: "Bangalore",  state: "Karnataka"        },
      "400001": { city: "Mumbai",     state: "Maharashtra"      },
      "110001": { city: "New Delhi",  state: "Delhi"            },
    };

    if (KNOWN[pincode]) {
      return NextResponse.json(KNOWN[pincode]);
    }

    return NextResponse.json({ error: "Could not fetch pincode details" }, { status: 503 });
  }
}
