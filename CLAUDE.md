# Maa Flavours — Project Context for Claude

## What is this?
E-commerce website for **Maa Flavours** — an Andhra homemade pickle business run by Ram from Ongole, AP.
Live at: **https://maaflavours.com**
Admin panel: **https://maaflavours.com/admin**
GitHub: `Ram14297/maaflavours-website` (branch: `main`, auto-deploys to Vercel)

## Tech Stack
- **Framework**: Next.js 14 App Router, TypeScript, React
- **Database**: Supabase (PostgreSQL) — service role client for admin ops
- **Styling**: Tailwind CSS + custom CSS variables in `src/styles/globals.css`
- **State**: Zustand (`src/store/cartStore.ts`)
- **Email**: Resend (`src/lib/email.ts`) — from `orders@maaflavours.com`
- **SMS**: Fast2SMS (`src/lib/notify-customer.ts`)
- **Payments**: Cashfree + PhonePe QR + COD
- **Shipping**: Shiprocket (`src/lib/shiprocket.ts`) — auto-pushes orders on confirmation
- **Deployment**: Vercel (push to main = live in ~1 min)

## Brand Colors (CSS vars)
- `--color-brown`: #4A2C0A (headings)
- `--color-crimson`: #C0272D (CTAs, prices)
- `--color-gold`: #C8960C
- `--color-gold-light`: #E8B84B
- `--color-cream`: #FAFAF5
- `--color-warm-white`: #FFFFFF

## Products (all prices in paise in DB)
Pickles: Avakaya, Drumstick, Amla, Lemon, Gongura, Red Chilli
Powders: Curry Leaf Powder, Pappulapodi
Variants: 250g and 500g (some have 100g)

**Current prices (original MRP — launch offer ended May 31st):**
- Avakaya: 250g=₹209, 500g=₹399
- Drumstick: 250g=₹199, 500g=₹399
- Amla: 250g=₹199, 500g=₹399
- Lemon: 250g=₹179, 500g=₹349
- Gongura: 250g=₹209, 500g=₹399
- Red Chilli: 250g=₹199, 500g=₹399
- Curry Leaf Powder: 250g=₹179, 500g=₹329
- Pappulapodi: 250g=₹179, 500g=₹329

## Key Business Details
- **Phone**: +91 97014 52929
- **WhatsApp**: wa.me/919701452929
- **Email**: maaflavours74@gmail.com
- **Address**: Ongole, Andhra Pradesh — 523001
- **Free shipping**: above ₹899
- **Delivery**: 5–7 working days, pan-India via Shiprocket
- **DTDC deal**: ₹60/kg for AP & Telangana, ₹120/kg for rest (use for local orders ≤1.5kg)

## Important Files
```
src/lib/email.ts                          — All 5 transactional email templates (Resend)
src/lib/shiprocket.ts                     — Shiprocket API integration
src/lib/notify-customer.ts               — SMS notification functions (Fast2SMS)
src/lib/google-reviews.ts                — Google Places reviews (needs API key)
src/app/api/delivery/status/route.ts     — Shiprocket webhook (auto-updates order status)
src/app/api/admin/orders/[orderId]/      — Admin order PATCH (auto-pushes to Shiprocket on "packed")
src/app/api/checkout/create-order/       — Order creation (COD + PhonePe QR)
src/app/api/checkout/cashfree-webhook/   — Cashfree payment confirmation
src/app/api/settings/public/route.ts     — Public settings API (announcement, business, social)
src/components/layout/AnnouncementBar.tsx — Top announcement bar (reads from admin settings)
src/components/cart/CartOrderSummary.tsx  — Free shipping progress bar + confetti
src/store/cartStore.ts                    — Zustand cart store
src/styles/globals.css                    — Global styles + brand CSS variables
```

## Order Status Flow
`pending → confirmed → packed → shipped → out_for_delivery → delivered`

**Auto-triggers:**
- Order confirmed → pushed to Shiprocket automatically
- Admin marks "packed" → auto-pushes to Shiprocket if not already there
- Shiprocket status updates → webhook at `/api/delivery/status` → auto-updates order + notifies customer

## Notifications per Status Change
| Status | SMS | Email |
|--------|-----|-------|
| confirmed | ✅ | ✅ |
| packed | ✅ | ❌ |
| shipped | ✅ | ✅ |
| out_for_delivery | ✅ | ❌ |
| delivered | ✅ | ✅ |

Email fonts: Cormorant Garamond (headings) + Lato (body)

## Shiprocket Webhook
- URL: `https://maaflavours.com/api/delivery/status`
- Already registered in Shiprocket → Settings → Webhooks ✅
- Note: URL cannot contain "shiprocket", "sr", or "kr"

## Google Reviews (NOT YET SET UP)
Code is ready in `src/lib/google-reviews.ts`.
Needs these env vars in Vercel:
- `GOOGLE_PLACES_API_KEY` — from Google Cloud Console (enable Places API)
- `GOOGLE_PLACE_ID` — find at developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
Currently 2 reviews on Google: 5.0 ⭐ (Bindu Bhargavi + Gayathri vippagunta)

## Pending Tasks
- [ ] **Post-delivery feedback message** — SMS to customers ~1 day after delivery asking how they liked the pickles. User wants warm, formal tone. Trigger: order status → delivered.
- [ ] **Google Reviews setup** — need Place ID + API key (see above)
- [ ] **WhatsApp Cloud API** — replace SMS with branded WhatsApp messages. Needs Meta Business verification (GST docs). User chose to do this in a few days.
- [ ] **Blog content** — /blog page shows "Coming Soon". Need actual posts.
- [ ] **GST registration** — urgent for Amazon selling
- [ ] **Trademark** — "Maa Flavours"
- [ ] **DTDC commercial account** — visit Ongole office

## Admin Panel Sections
- `/admin` — Dashboard with revenue, orders, prep widget
- `/admin/orders` — Order list (excludes "pending" = abandoned checkouts)
- `/admin/orders/[orderId]` — Order detail with status update, Shiprocket push button, GST invoice
- `/admin/products` — Product management
- `/admin/settings` — Announcement bar, business info, social links
- `/admin/cost-calculator` — Profit margin calculator with pricing panel

## Decisions Made (don't revisit unless asked)
- **No corner ornaments** on product cards (removed)
- **No launch offer** pricing/discounts (offer ended May 31st)
- **Delhivery Surface** preferred over DTDC for Bangalore and other non-AP/TG states
- **Fast2SMS for SMS** (not WhatsApp — will migrate to WhatsApp Cloud API later)
- **No BSP** for WhatsApp (will use Meta's direct WhatsApp Cloud API)
- **Frovo vending machine partnership** — not pursued (pickle jars don't fit vending machines)

## Supabase
- URL: `https://anhlnwumpnvwvwaftven.supabase.co`
- Tables: orders, order_items, order_status_history, products, product_variants, customers, settings, categories
- Key view: `orders_summary` (used in admin APIs)

## Environment Variables (Vercel)
Already set: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, RESEND_API_KEY, FAST2SMS_API_KEY, CASHFREE_APP_ID, CASHFREE_SECRET_KEY, SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD
Needed: GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID
