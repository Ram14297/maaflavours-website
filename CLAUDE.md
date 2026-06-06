# CLAUDE.md — Project Bible
_Last updated: 2026-06-06_

## Project Overview
**Maa Flavours** is a live e-commerce website selling authentic Andhra homemade pickles and spice powders, run by Ram from Ongole, AP. The site handles the full order lifecycle: product browsing → checkout (COD / PhonePe QR / Cashfree) → Shiprocket shipping integration → customer SMS + email notifications → admin order management. The project is in active production with real orders; the launch offer ended May 31st and all prices are now at original MRP. Admin notifications (new orders) go via CallMeBot WhatsApp API.

Live at: **https://maaflavours.com**
Admin panel: **https://maaflavours.com/admin**
GitHub: `Ram14297/maaflavours-website` (branch: `main`, auto-deploys to Vercel in ~1 min)

---

## Tech Stack
- **Framework**: Next.js 14 App Router, TypeScript, React
- **Database**: Supabase (PostgreSQL) — service role client for admin ops
- **Styling**: Tailwind CSS + custom CSS variables in `src/styles/globals.css`
- **State**: Zustand (`src/store/cartStore.ts`)
- **Email**: Resend (`src/lib/email.ts`) — from `orders@maaflavours.com`
- **SMS**: Fast2SMS Quick SMS route (`src/lib/notify-customer.ts`)
- **Admin alerts**: CallMeBot WhatsApp API (new order notifications to admin)
- **Payments**: Cashfree + PhonePe QR + COD
- **Shipping**: Shiprocket (`src/lib/shiprocket.ts`) — auto-pushes orders on confirmation
- **Deployment**: Vercel (push to `main` = live in ~1 min)

---

## Brand Colors (CSS vars in `src/styles/globals.css`)
- `--color-brown`: #4A2C0A (headings, primary text)
- `--color-crimson`: #C0272D (CTAs, prices, alerts)
- `--color-gold`: #C8960C (highlights, badges)
- `--color-gold-light`: #E8B84B (secondary accents)
- `--color-cream`: #FAFAF5 (page backgrounds)
- `--color-warm-white`: #FFFFFF (card backgrounds)

---

## Environment Variables & Configuration

| Variable | Purpose | Set In | Status |
|----------|---------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Vercel | ✅ Confirmed |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key | Vercel | ✅ Confirmed |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (admin DB ops) | Vercel | ✅ Confirmed |
| `RESEND_API_KEY` | Transactional email via Resend | Vercel | ✅ Confirmed |
| `FAST2SMS_API_KEY` | SMS via Fast2SMS (Quick SMS route) | Vercel | ✅ Confirmed |
| `CASHFREE_APP_ID` | Cashfree payment gateway app ID | Vercel | ✅ Confirmed |
| `CASHFREE_SECRET_KEY` | Cashfree payment gateway secret | Vercel | ✅ Confirmed |
| `CASHFREE_WEBHOOK_SECRET` | Cashfree webhook HMAC verification | Vercel | ✅ Confirmed |
| `CASHFREE_ENV` | `"production"` or `"sandbox"` | Vercel | ✅ Confirmed |
| `SHIPROCKET_EMAIL` | Shiprocket API user email | Vercel | ✅ Confirmed |
| `SHIPROCKET_PASSWORD` | Shiprocket API user password | Vercel | ✅ Confirmed |
| `ADMIN_EMAIL` | Admin login email | Vercel | ✅ Confirmed |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password | Vercel | ✅ Confirmed |
| `ADMIN_JWT_SECRET` | Signs admin session JWTs (24h expiry) | Vercel | ✅ Confirmed |
| `NEXT_PUBLIC_SITE_URL` | Full site URL for email links | Vercel | ✅ (fallback: maaflavours.com) |
| `ADMIN_WHATSAPP_NUMBER` | Admin WhatsApp number for CallMeBot alerts | Vercel | ⚠️ Optional |
| `CALLMEBOT_API_KEY` | CallMeBot API key for admin WhatsApp alerts | Vercel | ⚠️ Optional |
| `OWNER_MOBILE` | Owner mobile for daily prep SMS (default: 9701452929) | Vercel | ⚠️ Optional |
| `CRON_SECRET` | Bearer token protecting `/api/cron/daily-prep` | Vercel | ⚠️ Set if cron enabled |
| `ALLOWED_ORIGINS` | Extra CORS origins (staging/preview URLs) | Vercel | ⚠️ Optional |
| `ALLOW_DESTRUCTIVE_ADMIN` | Enables `/api/admin/clear-test-data` (NEVER set in prod) | Vercel | ❌ Leave unset |
| `GOOGLE_PLACES_API_KEY` | Google Places API for website reviews section | Vercel | ❌ NOT SET — inactive |
| `GOOGLE_PLACE_ID` | Google Place ID for Maa Flavours listing | Vercel | ❌ NOT SET — inactive |

---

## Webhooks & External Endpoints

| Direction | URL / Pattern | Event | Handler | Status |
|-----------|--------------|-------|---------|--------|
| Inbound | `POST /api/delivery/status` | Shiprocket shipment status change | `src/app/api/delivery/status/route.ts` | ✅ Registered & working |
| Inbound | `POST /api/checkout/cashfree-webhook` | Cashfree payment confirmation | `src/app/api/checkout/cashfree-webhook/route.ts` | ✅ Working |
| Inbound | `GET /api/cron/daily-prep` | Daily prep SMS summary | `src/app/api/cron/daily-prep/route.ts` | ⚠️ Needs CRON_SECRET |
| Outbound | `https://apiv2.shiprocket.in/v1/external/auth/login` | Shiprocket token auth | `src/lib/shiprocket.ts` | ✅ Working |
| Outbound | `https://apiv2.shiprocket.in/v1/external/orders/create/adhoc` | Push order to Shiprocket | `src/lib/shiprocket.ts` | ✅ Working |
| Outbound | Fast2SMS Quick SMS API | Customer + owner SMS | `src/lib/notify-customer.ts` | ✅ Working |
| Outbound | Resend API | Transactional emails | `src/lib/email.ts` | ✅ Working |
| Outbound | CallMeBot WhatsApp API | Admin new-order WhatsApp alert | `src/app/api/checkout/cashfree-webhook/route.ts` | ⚠️ Optional (needs env vars) |

> **CRITICAL**: Shiprocket webhook URL must NOT contain "shiprocket", "sr", or "kr".
> Registered URL: `https://maaflavours.com/api/delivery/status` ← do NOT rename.

---

## Architecture — Key Files

### Core Business Logic
```
src/lib/shiprocket.ts                     — Shiprocket API: auth, weight estimation, order push
src/lib/email.ts                          — All 5 transactional email templates (Resend)
src/lib/notify-customer.ts               — SMS functions (Fast2SMS); all calls are non-fatal
src/lib/google-reviews.ts                — Google Places reviews (code ready, needs API key)
src/lib/admin-auth.ts                    — Admin JWT auth (sign/verify); separate from customer Supabase OTP
src/lib/customer-auth.ts                 — Customer session helper (Supabase OTP)
src/lib/origin-check.ts                  — CORS origin whitelist
```

### API Routes — Checkout
```
src/app/api/checkout/create-order/       — COD + PhonePe QR order creation; auto-pushes to Shiprocket
src/app/api/checkout/cashfree-create/    — Cashfree payment session creation
src/app/api/checkout/cashfree-webhook/   — Cashfree payment confirmation + Shiprocket push + admin alert
src/app/api/checkout/phonepe-initiate/   — PhonePe QR payment initiation
```

### API Routes — Admin
```
src/app/api/admin/orders/route.ts                          — Order list (excludes pending/abandoned)
src/app/api/admin/orders/[orderId]/route.ts                — GET/PATCH/DELETE single order; auto Shiprocket push on "packed"
src/app/api/admin/orders/[orderId]/push-shiprocket/route.ts — Manual Shiprocket push
src/app/api/admin/orders/invoice/route.ts                  — GST invoice data
src/app/api/admin/login/route.ts                           — Admin email+bcrypt login (DB rate-limited)
src/app/api/admin/prep-summary/                            — Today's prep widget data
src/app/api/admin/inventory/                               — Stock adjustment + restock notification trigger
src/app/api/admin/customers/                               — Customer management
src/app/api/admin/expenses/                                — Expense tracking
src/app/api/admin/analytics/                               — Revenue analytics
```

### API Routes — Public
```
src/app/api/delivery/status/route.ts     — Shiprocket webhook (auto-updates order status + notifies customer)
src/app/api/products/route.ts            — Product listing (no compare_at_price injection — launch offer removed)
src/app/api/products/[slug]/route.ts     — Single product detail
src/app/api/settings/public/route.ts     — Announcement bar, business info, social links
src/app/api/reviews/route.ts             — Google reviews (inactive — needs API key)
src/app/api/restock-notify/route.ts      — Customer restock email signup
src/app/api/cron/daily-prep/route.ts     — Daily prep SMS to owner (Bearer auth via CRON_SECRET)
```

### Admin UI Pages
```
src/app/admin/page.tsx                   — Dashboard: revenue, new orders, today's prep widget
src/app/admin/orders/page.tsx            — Order list with status filters
src/app/admin/orders/[orderId]/page.tsx  — Order detail: status timeline, COD payment button, GST invoice, WhatsApp
src/app/admin/orders/new/page.tsx        — Manual order entry (WhatsApp/phone/walk-in orders)
src/app/admin/products/page.tsx          — Product management
src/app/admin/inventory/page.tsx         — Stock management
src/app/admin/settings/page.tsx          — Announcement bar, business info, social links
src/app/admin/cost-calculator/page.tsx   — Profit margin calculator with real pricing panel
src/app/admin/prep/page.tsx              — Today's preparation list
src/app/admin/customers/page.tsx         — Customer list
src/app/admin/analytics/page.tsx         — Revenue & sales analytics
src/app/admin/expenses/page.tsx          — Expense tracking
```

### Frontend Components
```
src/components/admin/AdminUI.tsx         — Admin design system (Card, Btn, Table, Alert, Modal, etc.)
src/components/layout/AnnouncementBar.tsx — Top bar (reads from admin settings API)
src/components/cart/CartDrawer.tsx       — Slide-in cart with free-shipping progress bar
src/components/cart/CartOrderSummary.tsx — Free shipping bar + confetti at ₹899
src/components/product/ProductCard.tsx   — Product listing card (no corner ornaments)
src/store/cartStore.ts                   — Zustand cart store
src/styles/globals.css                   — Brand CSS variables (no .corner-tl/tr/bl/br classes)
```

---

## Products & Pricing
**CRITICAL: All prices stored in paise (₹1 = 100 paise). ₹399 → stored as 39900.**

Launch offer ended May 31st. All prices reverted to original MRP.

| Product | 250g | 500g |
|---------|------|------|
| Avakaya (Mango Pickle) | ₹209 | ₹399 |
| Drumstick Pickle | ₹199 | ₹399 |
| Amla Pickle | ₹199 | ₹399 |
| Lemon Pickle | ₹179 | ₹349 |
| Gongura Pickle | ₹209 | ₹399 |
| Red Chilli Pickle | ₹199 | ₹399 |
| Curry Leaf Powder | ₹179 | ₹329 |
| Pappulapodi | ₹179 | ₹329 |

**Free shipping** above ₹899. Delivery: 5–7 working days pan-India via Shiprocket.

### New Products (NOT YET ON WEBSITE — phone orders came Jun 6)
| Product | Size | Price |
|---------|------|-------|
| Tomato Pickle | 1KG | ₹799 |
| Chitla Podi | 500g | ₹379 |
| Maagaya (Mango variant) | 500g | ₹479 |

---

## Order Status Flow
```
pending → confirmed → processing → packed → shipped → out_for_delivery → delivered
                                                    (also: cancelled, refunded)
```

**Auto-triggers:**
- Order confirmed → auto-pushed to Shiprocket (COD/PhonePe in `create-order`; Cashfree in `cashfree-webhook`)
- Admin marks "packed" → auto-pushes to Shiprocket if not already there
- Shiprocket webhook fires → `/api/delivery/status` → auto-updates DB + notifies customer
- **AWB gap**: AWB only exists after admin selects courier in Shiprocket. Webhook saves AWB back to DB using `shiprocket_shipment_id` fallback on first match.

---

## Notifications per Status Change

| Status | SMS | Email | Admin WhatsApp |
|--------|-----|-------|----------------|
| confirmed | ✅ | ✅ | ✅ (CallMeBot) |
| packed | ✅ | ❌ | ❌ |
| shipped | ✅ | ✅ | ❌ |
| out_for_delivery | ✅ | ❌ | ❌ |
| delivered | ✅ | ✅ | ❌ |
| cancelled | ✅ | ✅ | ❌ |

Email fonts: **Cormorant Garamond** (headings) + **Lato** (body)

---

## Supabase Schema

**URL**: `https://anhlnwumpnvwvwaftven.supabase.co`

| Table | Purpose |
|-------|---------|
| `orders` | Main orders (cols: shiprocket_order_id, shiprocket_shipment_id, tracking_id, payment_status) |
| `order_items` | Line items per order |
| `order_status_history` | Audit log of every status change (changed_by, note) |
| `products` | Product catalogue |
| `product_variants` | Size/price variants |
| `customers` | Customer profiles (Supabase auth) |
| `customer_addresses` | Saved delivery addresses |
| `settings` | Key-value for admin-editable config |
| `categories` | Product categories |
| `admin_users` | Admin login (bcrypt; cols: failed_login_count, locked_until for brute-force protection) |
| `restock_notifications` | Customer emails for out-of-stock alerts |
| `expenses` | Business expense tracking |

**Key view:** `orders_summary` — used in all admin order list/detail APIs.
**Migrations applied:** 001 through 010 (latest: `010_restock_notifications.sql`).

---

## Key Business Details
- **Phone**: +91 97014 52929 | **WhatsApp**: wa.me/919701452929
- **Email**: maaflavours74@gmail.com
- **Address**: Ongole, Andhra Pradesh — 523001
- **DTDC deal**: ₹60/kg for AP & Telangana, ₹120/kg for rest (use for local orders ≤1.5kg)
- **Preferred courier for non-AP**: Delhivery Surface (not DTDC Air, not Delhivery Air)
- **Delhivery Surface 2 Kgs (₹159)** requires Shiprocket Insights activation — use standard Surface (₹191) instead

---

## Session Log

### Session: 2026-05-31 (Pre-compaction)
**Goal:** Remove corner ornaments, upgrade email fonts, revert prices to MRP, set up Shiprocket full integration
**Completed (✅):**
- Removed gold L-shaped corner ornaments from all product cards + image gallery
- Upgraded email fonts: Cormorant Garamond (headings) + Lato (body)
- Reverted all 16 product variant prices to original MRP (launch offer ended May 31)
- Built Shiprocket auto-status webhook at `/api/delivery/status`
- Fixed webhook URL (Shiprocket blocks "shiprocket" in URLs)
- Built auto-push to Shiprocket when admin marks order "packed"
- Added manual "🚀 Push to Shiprocket" button in admin order detail
- Created CLAUDE.md for session continuity
**Key decisions:**
- Webhook URL must not contain "shiprocket", "sr", "kr" → use `/api/delivery/status`
- AWB is NOT assigned at order creation; only after courier selection in Shiprocket UI
- Fast2SMS over WhatsApp (WhatsApp Cloud API needs Meta Business verification — deferred)

### Session: 2026-06-04 (Pre-compaction)
**Goal:** Fix order MAA-20260511-0005 stuck at "packed" despite being "IN TRANSIT" in Shiprocket
**Completed (✅):**
- Diagnosed root cause: `tracking_id` was empty string because AWB only comes after courier selection
- Manually updated order: status→shipped, tracking_id→19041925135244, courier→Delhivery Surface
- Added `shiprocket_shipment_id` fallback matching in webhook (3 fallback strategies now)
- Webhook now saves AWB back to DB when found via shipment_id or sr_order_id fallback
**Gotchas:**
- Delhivery Surface 2 Kgs (₹159) requires "Insights" activation — use standard Delhivery Surface (₹191)

### Session: 2026-06-06
**Goal:** Add COD payment collection control in admin panel
**Completed (✅):**
- Added "💵 Mark Payment Collected" button in Payment Summary card on order detail page
- Visible only for COD orders with payment_status ≠ "paid"; disappears once marked
- Calls PATCH paymentStatus:"paid" → DB updated, note logged in order timeline
- Calculated phone order totals for family orders: Teja ₹1,956 | Gayathri ₹1,278 (both free shipping)
**Pending (⏳):**
- Add 3 new products to website: Tomato Pickle 1KG, Chitla Podi, Maagaya

---

## Open Tasks (Master List)

| Priority | Status | Task | Notes |
|----------|--------|------|-------|
| P1 | ⏳ | Add Tomato Pickle (1KG) to website | ₹799; came through phone orders Jun 6 |
| P1 | ⏳ | Add Chitla Podi (500g) to website | ₹379 per 500g jar; confirm 250g price |
| P1 | ⏳ | Add Maagaya (Mango pickle variant, 500g) | ₹479; confirm other sizes |
| P1 | ⏳ | Set up Google Reviews on website | Code ready in `src/lib/google-reviews.ts`. Add `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID` to Vercel. Find Place ID: developers.google.com/maps/documentation/javascript/examples/places-placeid-finder |
| P1 | ⏳ | GST registration | Urgent — needed before selling on Amazon |
| P2 | ⏳ | Post-delivery feedback message | SMS+email ~1 day after delivery, asking how they liked the pickles. Needs: timing (immediate vs 1 day), feedback link (Google Form vs WhatsApp reply), specific questions. Not started. |
| P2 | ⏳ | WhatsApp Cloud API | Replace Fast2SMS with Meta's WhatsApp Cloud API. Needs Meta Business verification (GST docs + Facebook Business Manager + dedicated phone number). User deferred to "a few days". |
| P2 | ⏳ | Blog content | `/blog` shows "Coming Soon". Need actual posts. |
| P3 | ⏳ | Trademark registration | "Maa Flavours" |
| P3 | ⏳ | DTDC commercial account | Visit Ongole office for ₹60/kg AP rate |

---

## Known Issues & Workarounds

### Shiprocket AWB Gap (IMPORTANT)
AWB (Air Waybill / tracking number) is NOT available when an order is first pushed to Shiprocket. It's only assigned when admin logs into Shiprocket → selects courier → clicks "Ship Now".

**Webhook fallback chain (implemented):**
1. Match by `tracking_id` (AWB) — works once AWB is saved
2. Match by `shiprocket_shipment_id` → saves AWB back to DB
3. Match by `shiprocket_order_id` → saves AWB back to DB

**Admin step required:** After pushing order to Shiprocket, go to Shiprocket dashboard, select courier, click "Ship Now". All subsequent webhook events will auto-update the order.

### COD Payment Status
COD orders start with `payment_status = "pending"` (correct — cash not collected yet).
Admin must tap "💵 Mark Payment Collected" in the Payment Summary card after cash is received.

### Shiprocket Webhook URL
Registered at: `https://maaflavours.com/api/delivery/status`
Do NOT rename — Shiprocket blocks URLs containing "shiprocket", "sr", or "kr".

### Admin Brute-Force Lockout
After 5 failed logins, admin locked for 15 minutes (DB-backed, survives cold starts).
Recovery: reset `failed_login_count = 0` and `locked_until = NULL` in `admin_users` via Supabase dashboard.

### Paise vs Rupees
ALL price columns in DB are in paise. ₹399 = `39900`. Always divide by 100 for display.

---

## Admin Panel Sections
- `/admin` — Dashboard: revenue, new orders, today's prep widget
- `/admin/orders` — Order list (excludes "pending" = abandoned checkouts)
- `/admin/orders/[orderId]` — Full detail: status timeline, COD payment button, Shiprocket push, GST invoice, WhatsApp message generator
- `/admin/orders/new` — Manual order entry for phone/WhatsApp/walk-in orders
- `/admin/products` — Product management
- `/admin/inventory` — Stock management + restock notifications
- `/admin/settings` — Announcement bar, business info, social links
- `/admin/cost-calculator` — Profit margin calculator
- `/admin/prep` — Today's preparation list
- `/admin/customers` — Customer list
- `/admin/analytics` — Revenue & sales analytics
- `/admin/expenses` — Expense tracking

---

## Decisions Made (don't revisit unless asked)
- **No corner ornaments** on product cards (permanently removed)
- **No launch offer** pricing (ended May 31st; no compare_at_price injection in API)
- **Delhivery Surface** preferred over DTDC for non-AP/TG states
- **Fast2SMS for SMS** — will migrate to WhatsApp Cloud API later (not now)
- **No BSP for WhatsApp** — will use Meta's direct WhatsApp Cloud API when ready
- **Frovo vending machine partnership** — not pursued (pickle jars don't fit)
- **Admin auth is separate from Supabase OTP** — uses bcrypt + custom JWT stored in `mf-admin-token` cookie

---

## How to Run Locally

```bash
# 1. Clone and install
git clone https://github.com/Ram14297/maaflavours-website.git
cd maaflavours-website
npm install

# 2. Create .env.local with required vars (see Environment Variables table above)
# Minimum required: SUPABASE_*, CASHFREE_*, SHIPROCKET_*, RESEND_API_KEY, FAST2SMS_API_KEY

# 3. Run dev server
npm run dev   # → http://localhost:3000

# 4. Admin login
# → http://localhost:3000/admin/login
# Credentials come from admin_users table in Supabase DB
```

For webhook testing locally: use `ngrok http 3000` and temporarily update webhook URLs in Shiprocket + Cashfree dashboards.

---

## Next Session — Recommended Starting Point

**First task:** Add the 3 new products (Tomato Pickle 1KG, Chitla Podi 500g, Maagaya 500g) — these were sold via phone on Jun 6 but have no product pages yet.

**How:** Use `/admin/products` in the admin panel to create new products, OR insert directly into Supabase `products` + `product_variants` tables. Confirm all variant prices and sizes with Ram before publishing.

**Second task:** Set up Google Reviews — add `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` to Vercel env vars. The implementation is already complete in `src/lib/google-reviews.ts`.

**Prerequisite check:**
```bash
git status            # should be clean
git log --oneline -3  # last commit should be 74794f2 (COD payment button)
```
