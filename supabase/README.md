# supabase/README.md
# Maa Flavours — Supabase Database Setup Guide

## Quick Start (New Project)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your project dashboard
3. Paste the contents of `schema.sql` and click **Run**
4. That's it — tables, triggers, views, RLS policies, and seed data are all set up

---

## Files in This Directory

| File | Purpose |
|------|---------|
| `schema.sql` | Complete schema — run this on a fresh Supabase project |
| `migrations/001_initial_schema.sql` | Same as schema.sql, formatted as a Supabase CLI migration |

---

## Environment Variables Needed

Copy these to your `.env.local` file:

```bash
# Supabase — from Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # anon / public key
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # service_role key (SECRET — never expose to client)

# Razorpay — from Razorpay Dashboard
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# Twilio — from Twilio Console
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_VERIFY_SERVICE_SID=VAxxx

# Admin
ADMIN_EMAIL=admin@maaflavours.com
ADMIN_PASSWORD_HASH=    # bcrypt hash — generate below

# Site
NEXT_PUBLIC_SITE_URL=https://maaflavours.com
```

---

## Generate Admin Password Hash

```bash
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('YourSecurePasswordHere', 10).then(hash => {
  console.log('ADMIN_PASSWORD_HASH=' + hash);
});"
```

Then update the admin_users seed data in schema.sql with this hash **before deploying**.

---

## ⚠️ IMPORTANT: Price Format

**All monetary values in the database are stored in PAISE (not Rupees).**

| ₹ (Rupees) | Paise in DB |
|------------|-------------|
| ₹180       | 18000       |
| ₹320       | 32000       |
| ₹499       | 49900       |
| ₹60        | 6000        |

**Why paise?** Avoids floating-point precision issues with decimal rupees in PostgreSQL.

**In code:** Divide by 100 for display. Multiply by 100 when inserting.
```typescript
// Display
const displayPrice = `₹${(priceInPaise / 100).toLocaleString('en-IN')}`;

// Insert
const priceInPaise = Math.round(rupeeAmount * 100);
```

---

## Table Summary

| Table | Rows at Seed | Purpose |
|-------|-------------|---------|
| `admin_users` | 1 | Admin panel login |
| `categories` | 3 | Spicy / Sour & Tangy / Seasonal |
| `products` | 6 | Maa Flavours pickle SKUs |
| `product_variants` | 12 | 250g + 500g per product |
| `product_images` | 0 | Add images via admin panel |
| `customers` | 0 | Created on OTP login |
| `customer_addresses` | 0 | Saved by customers |
| `coupons` | 4 | WELCOME50 / MAASPECIAL / FREESHIP / FESTIVE15 |
| `orders` | 0 | Created at checkout |
| `order_items` | 0 | Line items per order |
| `order_status_history` | 0 | Auto-created by trigger |
| `product_reviews` | 0 | Submitted by customers |
| `otp_sessions` | 0 | Auto-managed by auth flow |
| `newsletter_subscribers` | 0 | From newsletter signup |
| `contact_messages` | 0 | From contact form |
| `blog_posts` | 0 | Optional CMS (static posts in lib/constants/blog.ts) |
| `expenses` | 0 | Added via admin expense tracker |
| `settings` | 7 | Site / shipping / tax / social / etc. |

---

## Triggers

| Trigger | Table | Effect |
|---------|-------|--------|
| `trg_set_order_number` | orders | Auto-generates MAA-YYYYMMDD-NNNN format |
| `trg_update_product_rating` | product_reviews | Recalculates avg rating after review change |
| `trg_increment_coupon_usage` | orders | Increments coupon usage_count on order insert |
| `trg_update_customer_stats` | orders | Updates total_orders/total_spent on confirmation |
| `trg_log_order_status` | orders | Inserts audit row to order_status_history |
| `trg_manage_stock` | orders | Decrements/restores variant stock |
| `trg_*_updated_at` | All | Sets updated_at = NOW() on UPDATE |

---

## Views

| View | Purpose |
|------|---------|
| `products_with_details` | Products + primary image + price range + stock status |
| `orders_summary` | Orders + customer name/mobile + item count |
| `low_stock_variants` | Variants at or below low_stock_threshold |

---

## Storage Buckets (Create Manually)

Go to **Supabase Dashboard → Storage → New Bucket**:

| Bucket | Public | Use |
|--------|--------|-----|
| `product-images` | ✅ Yes | Product photos |
| `blog-images` | ✅ Yes | Blog post cover images |
| `receipts` | ❌ No | Admin expense receipts |
| `admin-uploads` | ❌ No | Temporary upload staging |

---

## Supabase Auth Setup

1. Go to **Authentication → Settings**
2. **Disable** email confirmations (we use OTP via Twilio, not email)
3. Set **JWT expiry** to 604800 (7 days)
4. Under **Providers**, enable only **Phone** (for OTP flow)

---

## RLS Policy Summary

| Who | Can Do |
|-----|--------|
| Public (anon) | Read active products, categories, variants, images; read approved reviews; read published blog posts; INSERT to newsletter and contact forms |
| Authenticated customer | All of above + read/write own profile, addresses, orders, reviews |
| Service role (API routes) | Everything — bypasses RLS |
| Admin panel | Everything — uses service role key |

---

## Production Checklist

- [ ] Replace `ADMIN_PASSWORD_HASH` placeholder in schema.sql with real bcrypt hash
- [ ] Set all environment variables in Vercel project settings
- [ ] Create storage buckets (product-images, blog-images, receipts, admin-uploads)
- [ ] Upload product images to `product-images` bucket
- [ ] Add real product images to `product_images` table
- [ ] Enable Supabase Realtime on `orders` table (for live order tracking)
- [ ] Set up Supabase scheduled function to clean expired OTP sessions
- [ ] Enable Point-in-Time Recovery (PITR) on production Supabase project
- [ ] Test all Razorpay webhooks
- [ ] Test OTP flow with real Twilio credentials
