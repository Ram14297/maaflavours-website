# 🫙 Maa Flavours — maaflavours.com

> **Authentic Andhra Taste — The Way Maa Made It**  
> Premium D2C e-commerce for homemade Andhra pickles from Ongole.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS (brand-configured) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + Twilio Verify (OTP) |
| Payments | Razorpay (UPI, Cards, Netbanking, COD) |
| Hosting | Vercel |
| Images | Supabase Storage |

---

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-org/maa-flavours.git
cd maa-flavours
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Copy your project URL and anon key to `.env.local`

### 4. Admin Setup

```bash
# Generate admin password hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-secure-password', 12));"
# Add output to ADMIN_PASSWORD_HASH in .env.local
```

### 5. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
# Admin panel: http://localhost:3000/admin
```

---

## Project Structure

```
maa-flavours/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   ├── page.tsx            # Homepage
│   │   ├── store/              # Store pages (products, cart, checkout)
│   │   ├── admin/              # Admin panel (protected)
│   │   └── api/                # API routes
│   │       ├── auth/           # OTP send/verify endpoints
│   │       ├── orders/         # Order management
│   │       ├── razorpay/       # Payment gateway
│   │       └── admin/          # Admin API routes
│   ├── components/
│   │   ├── layout/             # Navbar, Footer, Announcement bar
│   │   ├── ui/                 # Reusable UI (Button, Badge, Card...)
│   │   ├── product/            # Product cards, grid, detail
│   │   ├── cart/               # Cart drawer, cart item
│   │   ├── auth/               # OTP login modal
│   │   └── admin/              # Admin-specific components
│   ├── lib/
│   │   ├── supabase/           # Supabase client + server
│   │   ├── constants/          # Products, site config
│   │   └── utils.ts            # Shared utilities
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   └── styles/
│       └── globals.css         # Global styles + brand CSS
├── public/
│   ├── images/                 # Brand + product images (replace placeholders)
│   └── icons/                  # Favicon etc.
├── supabase/
│   └── schema.sql              # Complete database schema
├── tailwind.config.ts          # Brand color palette + custom utilities
├── next.config.js              # Next.js configuration
└── .env.example                # Environment variables template
```

---

## Brand Colors

| Variable | Hex | Usage |
|----------|-----|-------|
| `--color-crimson` | `#C0272D` | Primary brand red, CTAs |
| `--color-gold` | `#C8960C` | Gold accents, dividers |
| `--color-gold-light` | `#E8B84B` | Decorative highlights |
| `--color-brown` | `#4A2C0A` | Headings, body text |
| `--color-warm-white` | `#FAFAF5` | Page background |
| `--color-cream` | `#F5EFE0` | Section alternates |
| `--color-grey` | `#6B6B6B` | Subtext, captions |

> ⚠️ **DO NOT** use any colors outside this palette.

---

## Products (6 SKUs)

| Product | Subtitle | Tag | 250g | 500g |
|---------|----------|-----|------|------|
| Drumstick Pickle | Medium Spicy | Authentic Andhra Taste | ₹180 | ₹320 |
| Amla Pickle | Sour & Spicy | Rich in Vitamin C | ₹160 | ₹290 |
| Pulihora Gongura | Spicy | Rare & Traditional | ₹200 | ₹370 |
| Lemon Pickle | Sour & Spicy | Classic Andhra Staple | ₹150 | ₹270 |
| Maamidi Allam | Medium Spicy & Sweet | Best with Rice & Dosa | ₹190 | ₹350 |
| Red Chilli Pickle | Spicy | Best with Rice | ₹170 | ₹310 |

---

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID
ADMIN_EMAIL
ADMIN_PASSWORD_HASH
JWT_SECRET
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_WHATSAPP_NUMBER
```

---

## Image Placeholders

All image paths are marked with `// REPLACE with actual image` comments throughout the codebase. Replace placeholder images in:

- `public/images/products/` — Product photos (JPG/WebP, min 800×800px)
- `public/images/brand/` — Logo, hero images, OG image
- Supabase Storage bucket: `product-images`

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
# Add all env variables in Vercel dashboard
```

---

## License

Private — Maa Flavours, Ongole © 2025. All rights reserved.
