-- ═══════════════════════════════════════════════════════════════════════════
-- supabase/schema.sql
-- Maa Flavours — Complete Supabase PostgreSQL Schema v2.0
--
-- HOW TO DEPLOY:
--   Option A (Supabase Dashboard → SQL Editor):
--     Paste this entire file and click "Run"
--
--   Option B (Supabase CLI):
--     supabase db reset      (local dev only — destructive)
--     supabase db push       (applies to remote project)
--
-- STRUCTURE:
--   Section 1  — Extensions
--   Section 2  — Enum Types (8 enums)
--   Section 3  — Shared trigger function (fn_set_updated_at)
--   Section 4  — Tables (18 tables, dependency-ordered)
--   Section 5  — Custom Functions & Triggers (6 triggers)
--   Section 6  — Views (3 views)
--   Section 7  — Row Level Security (RLS policies)
--   Section 8  — Seed Data (categories, 6 products, 12 variants, coupons, settings)
--   Section 9  — Storage Bucket Reference
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 1 — EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 2 — ENUM TYPES
-- Drop and recreate if needed during development.
-- In production, use ALTER TYPE ... ADD VALUE to add new enum values.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE spice_level_enum AS ENUM ('mild', 'medium', 'spicy', 'extra-hot');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status_enum AS ENUM (
    'pending',           -- Order placed, awaiting payment confirmation
    'confirmed',         -- Payment confirmed OR COD order accepted
    'processing',        -- Being prepared in kitchen
    'packed',            -- Packed, ready for courier pickup
    'shipped',           -- Dispatched to courier
    'out_for_delivery',  -- Last-mile delivery
    'delivered',         -- Delivered to customer
    'cancelled',         -- Cancelled before dispatch
    'refunded'           -- Refund issued
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_enum AS ENUM (
    'razorpay_upi', 'razorpay_card', 'razorpay_netbanking', 'cod'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE coupon_type_enum AS ENUM ('flat', 'percent', 'free_shipping');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE address_type_enum AS ENUM ('home', 'work', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE admin_role_enum AS ENUM ('admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE expense_category_enum AS ENUM (
    'ingredients', 'packaging', 'delivery', 'marketing', 'utilities', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE blog_category_enum AS ENUM (
    'recipe', 'culture', 'health', 'tips', 'behind-the-scenes'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 3 — SHARED TRIGGER FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 4 — TABLES
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── 4.01  admin_users ───────────────────────────────────────────────────
-- Admin panel authentication (email + bcrypt password — NOT Supabase Auth)
-- Checked in API routes using bcryptjs.compare()

CREATE TABLE IF NOT EXISTS admin_users (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  email          TEXT         UNIQUE NOT NULL,
  password_hash  TEXT         NOT NULL,   -- bcrypt 10-round hash
  role           admin_role_enum NOT NULL DEFAULT 'admin',
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ─── 4.02  categories ────────────────────────────────────────────────────
-- Product categories: Spicy Collection | Sour & Tangy | Seasonal Specials

CREATE TABLE IF NOT EXISTS categories (
  id           UUID       PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT       NOT NULL,
  slug         TEXT       UNIQUE NOT NULL,
  description  TEXT,
  image_url    TEXT,      -- REPLACE with Supabase Storage URL
  sort_order   SMALLINT   NOT NULL DEFAULT 0,
  is_active    BOOLEAN    NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);


-- ─── 4.03  products ──────────────────────────────────────────────────────
-- 6 Maa Flavours pickle SKUs

CREATE TABLE IF NOT EXISTS products (
  id                UUID       PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT       UNIQUE NOT NULL,    -- e.g. "drumstick-pickle"
  name              TEXT       NOT NULL,           -- e.g. "Drumstick Pickle"
  subtitle          TEXT       NOT NULL DEFAULT '',-- e.g. "Murungakkai Urugai" (Telugu name)
  tag               TEXT       NOT NULL DEFAULT '',-- e.g. "Authentic Andhra Taste"
  spice_level       spice_level_enum NOT NULL DEFAULT 'medium',
  short_description TEXT       NOT NULL DEFAULT '',-- 1-2 sentence teaser for product card
  description       TEXT       NOT NULL DEFAULT '',-- Full description (HTML/markdown)
  ingredients       TEXT       NOT NULL DEFAULT '',-- Comma-separated ingredients list
  shelf_life_days   INTEGER    NOT NULL DEFAULT 90, -- Days at room temperature
  is_vegetarian     BOOLEAN    NOT NULL DEFAULT TRUE,
  is_active         BOOLEAN    NOT NULL DEFAULT TRUE,
  is_featured       BOOLEAN    NOT NULL DEFAULT FALSE,
  category_id       UUID       REFERENCES categories(id) ON DELETE SET NULL,
  meta_title        TEXT,
  meta_description  TEXT,
  -- Denormalised: updated by trigger after product_reviews INSERT/UPDATE
  average_rating    NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  review_count      INTEGER    NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_slug     ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (is_featured) WHERE is_featured = TRUE;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ─── 4.04  product_variants ──────────────────────────────────────────────
-- Each product has 2 variants: 250g and 500g
-- IMPORTANT: All monetary values stored in PAISE (1 INR = 100 paise)
-- Reason: avoids floating-point precision issues with decimal rupees
-- Display: divide by 100 — e.g. 18000 paise = ₹180

CREATE TABLE IF NOT EXISTS product_variants (
  id                   UUID       PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id           UUID       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  weight_grams         INTEGER    NOT NULL,          -- 250 or 500
  label                TEXT       NOT NULL,          -- "250g" or "500g"
  sku                  TEXT       UNIQUE NOT NULL,   -- e.g. "MF-DRUM-250"
  price                INTEGER    NOT NULL,          -- In paise. ₹180 = 18000
  discounted_price     INTEGER,                      -- Sale price in paise (NULL = no discount)
  stock_quantity       INTEGER    NOT NULL DEFAULT 0,
  low_stock_threshold  INTEGER    NOT NULL DEFAULT 10,
  is_active            BOOLEAN    NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_variant_price_positive CHECK (price > 0),
  CONSTRAINT chk_variant_stock_nonneg   CHECK (stock_quantity >= 0)
);
COMMENT ON COLUMN product_variants.price IS
  'Stored in PAISE. Divide by 100 for ₹ display. Example: 18000 = ₹180';
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants (product_id);
CREATE TRIGGER trg_variants_updated_at
  BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ─── 4.05  product_images ────────────────────────────────────────────────
-- Multiple images per product, stored in Supabase Storage

CREATE TABLE IF NOT EXISTS product_images (
  id          UUID       PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT       NOT NULL,   -- Supabase Storage public URL
                                     -- REPLACE with actual image URL
  alt         TEXT       NOT NULL,
  is_primary  BOOLEAN    NOT NULL DEFAULT FALSE,
  sort_order  SMALLINT   NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images (product_id);


-- ─── 4.06  customers ─────────────────────────────────────────────────────
-- Linked to Supabase auth.users via matching UUID (id = auth.users.id)
-- Created in auth.users FIRST, then this table on OTP login completion

CREATE TABLE IF NOT EXISTS customers (
  id            UUID    PRIMARY KEY,         -- = auth.users.id
  mobile        TEXT    UNIQUE NOT NULL,      -- 10-digit Indian mobile, no country code
  name          TEXT,
  email         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  -- Denormalised counters (updated by trg_update_customer_stats trigger)
  total_orders  INTEGER NOT NULL DEFAULT 0,
  total_spent   INTEGER NOT NULL DEFAULT 0,  -- In paise
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers (mobile);
CREATE INDEX IF NOT EXISTS idx_customers_email  ON customers (email) WHERE email IS NOT NULL;
CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ─── 4.07  customer_addresses ────────────────────────────────────────────
-- Saved delivery addresses. Enforced: only one is_default per customer.

CREATE TABLE IF NOT EXISTS customer_addresses (
  id             UUID   PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id    UUID   NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name           TEXT   NOT NULL,
  mobile         TEXT   NOT NULL,
  address_line1  TEXT   NOT NULL,
  address_line2  TEXT,
  landmark       TEXT,
  city           TEXT   NOT NULL,
  state          TEXT   NOT NULL,
  pincode        TEXT   NOT NULL,
  address_type   address_type_enum NOT NULL DEFAULT 'home',
  is_default     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON customer_addresses (customer_id);
-- Enforce one default per customer
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_address
  ON customer_addresses (customer_id) WHERE is_default = TRUE;
CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ─── 4.08  coupons ───────────────────────────────────────────────────────
-- Admin-created discount coupons. Applied at checkout.

CREATE TABLE IF NOT EXISTS coupons (
  id                   UUID   PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                 TEXT   UNIQUE NOT NULL,   -- e.g. "WELCOME50"
  description          TEXT,
  type                 coupon_type_enum NOT NULL,
  value                INTEGER NOT NULL,          -- Paise (flat/free_shipping) or percentage integer
  min_order_amount     INTEGER,                   -- Minimum cart value in paise (NULL = no min)
  max_discount_amount  INTEGER,                   -- Cap on % discounts in paise (NULL = no cap)
  usage_limit          INTEGER,                   -- Max total uses (NULL = unlimited)
  usage_count          INTEGER NOT NULL DEFAULT 0,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at           TIMESTAMPTZ,               -- NULL = never expires
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_coupon_value_positive CHECK (value > 0),
  CONSTRAINT chk_percent_le_100        CHECK (type != 'percent' OR value <= 100)
);
CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ─── 4.09  orders ────────────────────────────────────────────────────────
-- Core orders table.
-- shipping_address: JSONB snapshot (immutable — preserves address at time of order)
-- All monetary values in PAISE.
-- GST breakdown stored for admin invoice generation.

CREATE TABLE IF NOT EXISTS orders (
  id                   UUID   PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number         TEXT   UNIQUE NOT NULL DEFAULT '',  -- Set by trigger: MAA-YYYYMMDD-NNNN
  customer_id          UUID   NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,

  -- Immutable address snapshot at time of order (JSONB)
  -- Shape: { name, mobile, address_line1, address_line2?, landmark?, city, state, pincode }
  shipping_address     JSONB  NOT NULL,

  status               order_status_enum   NOT NULL DEFAULT 'pending',
  payment_status       payment_status_enum NOT NULL DEFAULT 'pending',
  payment_method       payment_method_enum NOT NULL,

  -- Pricing (all in paise)
  subtotal             INTEGER NOT NULL,            -- Sum of items before discounts
  discount             INTEGER NOT NULL DEFAULT 0,  -- Product-level discounts
  coupon_discount      INTEGER NOT NULL DEFAULT 0,  -- Coupon applied savings
  delivery_charge      INTEGER NOT NULL DEFAULT 0,  -- ₹60 = 6000 (free above ₹499)
  cod_charge           INTEGER NOT NULL DEFAULT 0,  -- ₹30 = 3000 for COD orders
  total                INTEGER NOT NULL,            -- Final amount charged

  coupon_code          TEXT,

  -- Razorpay
  razorpay_order_id    TEXT   UNIQUE,   -- rzp_ord_xxx
  razorpay_payment_id  TEXT   UNIQUE,   -- rzp_pay_xxx

  -- Shipping
  tracking_id          TEXT,
  courier_name         TEXT,            -- "DTDC", "BlueDart", "India Post"
  tracking_url         TEXT,
  dispatched_at        TIMESTAMPTZ,
  delivered_at         TIMESTAMPTZ,

  -- GST (pickles = HSN 2001, 12% GST: CGST 6% + SGST 6% intrastate, IGST 12% interstate)
  cgst_rate            NUMERIC(5,2) NOT NULL DEFAULT 6.00,
  sgst_rate            NUMERIC(5,2) NOT NULL DEFAULT 6.00,
  igst_rate            NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  cgst_amount          INTEGER NOT NULL DEFAULT 0,  -- In paise
  sgst_amount          INTEGER NOT NULL DEFAULT 0,
  igst_amount          INTEGER NOT NULL DEFAULT 0,

  customer_notes       TEXT,
  internal_notes       TEXT,   -- Admin-only

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id    ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_rzp_oid        ON orders (razorpay_order_id)   WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_rzp_pid        ON orders (razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ─── 4.10  order_items ───────────────────────────────────────────────────
-- Line items per order. Product details DENORMALISED as a snapshot.
-- This ensures order history is preserved even if products are later edited.

CREATE TABLE IF NOT EXISTS order_items (
  id             UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     UUID    NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id     UUID    NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,

  -- Snapshot fields (not to be updated — preserve order history)
  product_name   TEXT    NOT NULL,    -- "Drumstick Pickle" at time of order
  variant_label  TEXT    NOT NULL,    -- "250g" at time of order
  product_slug   TEXT    NOT NULL,    -- "drumstick-pickle" — for linking to product page
  product_image  TEXT,               -- Primary image URL at time of order
                                     -- REPLACE with actual image URL

  -- Pricing in paise (locked at time of order)
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  unit_price     INTEGER NOT NULL CHECK (unit_price > 0),   -- Price per item in paise
  total_price    INTEGER NOT NULL CHECK (total_price > 0)   -- quantity × unit_price
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);


-- ─── 4.11  order_status_history ──────────────────────────────────────────
-- Immutable audit log. Every status change is logged here by trigger.
-- Never update or delete from this table.

CREATE TABLE IF NOT EXISTS order_status_history (
  id          UUID   PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID   NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status  order_status_enum,          -- NULL for first entry
  new_status  order_status_enum NOT NULL,
  changed_by  TEXT   NOT NULL DEFAULT 'system',  -- 'system' | 'admin' | customer_id
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at — immutable audit log
);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history (order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_time     ON order_status_history (created_at DESC);


-- ─── 4.12  product_reviews ───────────────────────────────────────────────
-- Customer reviews. Admin approves before showing publicly.
-- Verified purchase = customer's order_id is linked and order is delivered.

CREATE TABLE IF NOT EXISTS product_reviews (
  id                   UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id           UUID     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id          UUID     NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id             UUID     REFERENCES orders(id) ON DELETE SET NULL,

  rating               SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title                TEXT,
  body                 TEXT     NOT NULL,
  customer_name        TEXT     NOT NULL,   -- Snapshot at time of review
  customer_city        TEXT,               -- Snapshot at time of review

  is_verified_purchase BOOLEAN  NOT NULL DEFAULT FALSE,
  is_approved          BOOLEAN  NOT NULL DEFAULT FALSE,
  is_featured          BOOLEAN  NOT NULL DEFAULT FALSE,
  helpful_count        INTEGER  NOT NULL DEFAULT 0,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_one_review_per_customer_product UNIQUE (customer_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id  ON product_reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved    ON product_reviews (is_approved) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_reviews_featured    ON product_reviews (is_featured) WHERE is_featured = TRUE;
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON product_reviews FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ─── 4.13  otp_sessions ──────────────────────────────────────────────────
-- Rate limiting for OTP requests. Service role only — no public access.
-- Twilio handles actual OTP delivery. This table: rate limit enforcement.
-- Rate limit: max 3 OTP sends per mobile per hour (enforced in API route).

CREATE TABLE IF NOT EXISTS otp_sessions (
  id             UUID       PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobile         TEXT       NOT NULL,
  otp_hash       TEXT       NOT NULL,       -- SHA-256 of OTP (never store plaintext)
  attempt_count  SMALLINT   NOT NULL DEFAULT 0,
  is_verified    BOOLEAN    NOT NULL DEFAULT FALSE,
  expires_at     TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '10 minutes',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_mobile     ON otp_sessions (mobile);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_expires_at ON otp_sessions (expires_at);


-- ─── 4.14  newsletter_subscribers ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        TEXT    UNIQUE NOT NULL,
  name         TEXT,
  coupon_sent  BOOLEAN NOT NULL DEFAULT FALSE,  -- WELCOME50 sent after signup?
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,   -- FALSE = unsubscribed
  source       TEXT    NOT NULL DEFAULT 'homepage',  -- 'homepage' | 'checkout' | 'blog'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);


-- ─── 4.15  contact_messages ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contact_messages (
  id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT    NOT NULL,
  mobile       TEXT    NOT NULL,
  email        TEXT,
  topic        TEXT    NOT NULL,   -- "Order Query", "Wholesale / Bulk Order", etc.
  message      TEXT    NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  is_resolved  BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notes  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_unread    ON contact_messages (is_read)     WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_contact_messages_resolved  ON contact_messages (is_resolved) WHERE is_resolved = FALSE;


-- ─── 4.16  blog_posts ────────────────────────────────────────────────────
-- Optional CMS. Currently content is in lib/constants/blog.ts (static).
-- This table allows admin-managed blog posts in the future.
-- body = JSONB array of ContentBlock objects (same structure as static constants).

CREATE TABLE IF NOT EXISTS blog_posts (
  id                UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT     UNIQUE NOT NULL,
  title             TEXT     NOT NULL,
  subtitle          TEXT     NOT NULL DEFAULT '',
  excerpt           TEXT     NOT NULL,
  body              JSONB    NOT NULL DEFAULT '[]'::JSONB,
  category          blog_category_enum NOT NULL,
  category_label    TEXT     NOT NULL,
  emoji             TEXT     NOT NULL DEFAULT '🫙',
  read_time         TEXT     NOT NULL DEFAULT '5 min read',
  author_name       TEXT     NOT NULL DEFAULT 'Maa Flavours Kitchen',
  author_role       TEXT     NOT NULL DEFAULT 'Ongole, Andhra Pradesh',
  tags              TEXT[]   NOT NULL DEFAULT '{}',
  is_featured       BOOLEAN  NOT NULL DEFAULT FALSE,
  is_published      BOOLEAN  NOT NULL DEFAULT TRUE,
  published_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  related_slugs     TEXT[]   NOT NULL DEFAULT '{}',
  cover_image_url   TEXT,    -- REPLACE with Supabase Storage URL
  meta_title        TEXT,
  meta_description  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug      ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category  ON blog_posts (category);
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ─── 4.17  expenses ──────────────────────────────────────────────────────
-- Admin expense tracker. Used for profit calculator in admin panel.
-- All amounts in PAISE.

CREATE TABLE IF NOT EXISTS expenses (
  id            UUID   PRIMARY KEY DEFAULT uuid_generate_v4(),
  category      expense_category_enum NOT NULL,
  description   TEXT   NOT NULL,
  amount        INTEGER NOT NULL CHECK (amount > 0),  -- In paise
  expense_date  DATE   NOT NULL DEFAULT CURRENT_DATE,
  receipt_url   TEXT,  -- Optional, stored in Supabase Storage (private bucket)
  added_by      TEXT,  -- Admin email or 'system'
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expenses_date     ON expenses (expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);
CREATE INDEX IF NOT EXISTS idx_expenses_month    ON expenses (DATE_TRUNC('month', expense_date));


-- ─── 4.18  settings ──────────────────────────────────────────────────────
-- Key-value store for admin-configurable settings.

CREATE TABLE IF NOT EXISTS settings (
  key          TEXT   PRIMARY KEY,
  value        JSONB  NOT NULL,
  description  TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 5 — FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── 5.1  Order number auto-generation ───────────────────────────────────
-- Format: MAA-20250701-0001 (resets counter per day)

CREATE OR REPLACE FUNCTION fn_generate_order_number()
RETURNS TEXT AS $$
DECLARE
  v_date  TEXT;
  v_count BIGINT;
BEGIN
  v_date  := TO_CHAR(NOW(), 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO v_count
  FROM orders WHERE created_at::DATE = CURRENT_DATE;
  RETURN 'MAA-' || v_date || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_trg_set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := fn_generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_number ON orders;
CREATE TRIGGER trg_set_order_number
  BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION fn_trg_set_order_number();


-- ─── 5.2  Product rating recalculation ───────────────────────────────────
-- Runs after any approved review change to update denormalised avg/count

CREATE OR REPLACE FUNCTION fn_trg_update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_product_id UUID;
BEGIN
  v_product_id := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE products SET
    average_rating = COALESCE((
      SELECT ROUND(AVG(rating)::NUMERIC, 2)
      FROM product_reviews
      WHERE product_id = v_product_id AND is_approved = TRUE
    ), 0.00),
    review_count = (
      SELECT COUNT(*) FROM product_reviews
      WHERE product_id = v_product_id AND is_approved = TRUE
    )
  WHERE id = v_product_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_product_rating ON product_reviews;
CREATE TRIGGER trg_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION fn_trg_update_product_rating();


-- ─── 5.3  Coupon usage count increment ───────────────────────────────────
-- Increments coupons.usage_count when an order with a coupon is inserted

CREATE OR REPLACE FUNCTION fn_trg_increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coupon_code IS NOT NULL AND NEW.coupon_discount > 0 THEN
    UPDATE coupons SET usage_count = usage_count + 1 WHERE code = NEW.coupon_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_coupon_usage ON orders;
CREATE TRIGGER trg_increment_coupon_usage
  AFTER INSERT ON orders FOR EACH ROW EXECUTE FUNCTION fn_trg_increment_coupon_usage();


-- ─── 5.4  Customer stats update ──────────────────────────────────────────
-- Updates total_orders and total_spent when an order is confirmed/cancelled

CREATE OR REPLACE FUNCTION fn_trg_update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Order confirmed: increment stats
  IF NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed' THEN
    UPDATE customers SET
      total_orders = total_orders + 1,
      total_spent  = total_spent + NEW.total
    WHERE id = NEW.customer_id;
  END IF;
  -- Order cancelled or refunded from confirmed: decrement
  IF NEW.status IN ('cancelled', 'refunded') AND OLD.status = 'confirmed' THEN
    UPDATE customers SET
      total_orders = GREATEST(total_orders - 1, 0),
      total_spent  = GREATEST(total_spent - NEW.total, 0)
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_customer_stats ON orders;
CREATE TRIGGER trg_update_customer_stats
  AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION fn_trg_update_customer_stats();


-- ─── 5.5  Order status audit log ─────────────────────────────────────────
-- Auto-inserts into order_status_history on every status change

CREATE OR REPLACE FUNCTION fn_trg_log_order_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_order_status ON orders;
CREATE TRIGGER trg_log_order_status
  AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION fn_trg_log_order_status();


-- ─── 5.6  Stock management ───────────────────────────────────────────────
-- Decrements stock when order confirmed, restores on cancel/refund

CREATE OR REPLACE FUNCTION fn_trg_manage_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement stock when order confirmed
  IF NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed' THEN
    UPDATE product_variants pv
    SET stock_quantity = GREATEST(pv.stock_quantity - oi.quantity, 0)
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.variant_id = pv.id;
  END IF;
  -- Restore stock when cancelled/refunded from confirmed
  IF NEW.status IN ('cancelled', 'refunded') AND OLD.status = 'confirmed' THEN
    UPDATE product_variants pv
    SET stock_quantity = pv.stock_quantity + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.variant_id = pv.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_manage_stock ON orders;
CREATE TRIGGER trg_manage_stock
  AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION fn_trg_manage_stock();


-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 6 — VIEWS
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── 6.1  products_with_details ──────────────────────────────────────────
-- Products + primary image + price range + stock summary
-- Used in product listing, product detail, and related products

CREATE OR REPLACE VIEW products_with_details AS
SELECT
  p.*,
  pi_primary.url              AS primary_image_url,
  pi_primary.alt              AS primary_image_alt,
  pv_agg.min_price,
  pv_agg.max_price,
  pv_agg.min_effective_price,
  pv_agg.total_stock,
  pv_agg.variant_count,
  pv_agg.has_low_stock,
  pv_agg.is_out_of_stock
FROM products p
LEFT JOIN LATERAL (
  SELECT url, alt FROM product_images pi
  WHERE pi.product_id = p.id AND pi.is_primary = TRUE
  LIMIT 1
) pi_primary ON TRUE
LEFT JOIN LATERAL (
  SELECT
    MIN(price)                                                 AS min_price,
    MAX(price)                                                 AS max_price,
    MIN(COALESCE(discounted_price, price))                     AS min_effective_price,
    SUM(stock_quantity)                                        AS total_stock,
    COUNT(*)                                                   AS variant_count,
    BOOL_OR(stock_quantity > 0 AND stock_quantity <= low_stock_threshold) AS has_low_stock,
    BOOL_AND(stock_quantity = 0)                               AS is_out_of_stock
  FROM product_variants pv
  WHERE pv.product_id = p.id AND pv.is_active = TRUE
) pv_agg ON TRUE;


-- ─── 6.2  orders_summary ─────────────────────────────────────────────────
-- Orders + customer details + item count aggregates (admin orders list)

CREATE OR REPLACE VIEW orders_summary AS
SELECT
  o.*,
  c.name           AS customer_name,
  c.mobile         AS customer_mobile,
  c.email          AS customer_email,
  oi_agg.item_count,
  oi_agg.total_quantity
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS item_count, SUM(quantity) AS total_quantity
  FROM order_items oi WHERE oi.order_id = o.id
) oi_agg ON TRUE;


-- ─── 6.3  low_stock_variants ─────────────────────────────────────────────
-- Variants where stock_quantity <= low_stock_threshold (admin dashboard alert)

CREATE OR REPLACE VIEW low_stock_variants AS
SELECT pv.*, p.name AS product_name, p.slug AS product_slug
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.stock_quantity <= pv.low_stock_threshold
  AND pv.is_active = TRUE AND p.is_active = TRUE
ORDER BY pv.stock_quantity ASC;


-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 7 — ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════
-- Strategy:
--   Public (anon) → can read products, categories, approved reviews, published blog posts
--   Authenticated (customer) → can read/write own profile, addresses, orders, reviews
--   Service role (API routes) → bypasses RLS entirely (used for all writes)
--   Admin panel → all queries use SUPABASE_SERVICE_ROLE_KEY → bypasses RLS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE admin_users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories               ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images           ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings                 ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: catalogue data

CREATE POLICY "Public read active categories"
  ON categories FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read active products"
  ON products FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read active variants"
  ON product_variants FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read product images"
  ON product_images FOR SELECT USING (TRUE);

CREATE POLICY "Public read approved reviews"
  ON product_reviews FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "Public read published blog posts"
  ON blog_posts FOR SELECT USING (is_published = TRUE);

-- AUTHENTICATED CUSTOMER: own profile

CREATE POLICY "Customer read own profile"
  ON customers FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Customer insert own profile"
  ON customers FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Customer update own profile"
  ON customers FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- AUTHENTICATED CUSTOMER: own addresses

CREATE POLICY "Customer read own addresses"
  ON customer_addresses FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customer insert own addresses"
  ON customer_addresses FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customer update own addresses"
  ON customer_addresses FOR UPDATE USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customer delete own addresses"
  ON customer_addresses FOR DELETE USING (auth.uid() = customer_id);

-- AUTHENTICATED CUSTOMER: own orders

CREATE POLICY "Customer read own orders"
  ON orders FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customer insert own order"
  ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customer read own order items"
  ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
  );

CREATE POLICY "Customer read own order status history"
  ON order_status_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
  );

-- AUTHENTICATED CUSTOMER: reviews

CREATE POLICY "Customer insert own review"
  ON product_reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customer update own review"
  ON product_reviews FOR UPDATE USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- PUBLIC INSERT: forms (anon allowed)

CREATE POLICY "Public subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Public submit contact form"
  ON contact_messages FOR INSERT WITH CHECK (TRUE);


-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 8 — SEED DATA
-- All monetary values in PAISE: ₹1 = 100 paise
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── 8.1  Categories ─────────────────────────────────────────────────────

INSERT INTO categories (id, name, slug, description, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Spicy Collection',  'spicy',      'Bold, fiery pickles. Traditional Andhra heat.',                   1),
  ('c1000000-0000-0000-0000-000000000002', 'Sour & Tangy',      'sour-tangy', 'Bright, tangy pickles with South Indian sourness.',               2),
  ('c1000000-0000-0000-0000-000000000003', 'Seasonal Specials', 'seasonal',   'Made when ingredients peak. Limited batches, unforgettable taste.', 3)
ON CONFLICT (slug) DO NOTHING;


-- ─── 8.2  Products ───────────────────────────────────────────────────────

INSERT INTO products (id, slug, name, subtitle, tag, spice_level, short_description, description, ingredients, shelf_life_days, is_featured, category_id) VALUES

  -- Product 1: Drumstick Pickle
  ('p1000000-0000-0000-0000-000000000001', 'drumstick-pickle', 'Drumstick Pickle', 'Murungakkai Urugai',
   'Authentic Andhra Taste', 'medium',
   'Tender drumsticks slow-pickled in cold-pressed sesame oil with traditional Andhra spices. The one that started it all.',
   '<p>Our Drumstick Pickle is Maa Flavours'' most beloved recipe — handed down through three generations of our family kitchen in Ongole. We select only firm, fresh drumsticks, cut them at peak season, and slow-pickle them in cold-pressed sesame oil with a proprietary blend of freshly ground red chillies, mustard, fenugreek, and asafoetida.</p>',
   'Drumsticks, Red Chilli Powder, Turmeric, Rock Salt, Mustard Seeds, Fenugreek Seeds, Asafoetida, Lemon Juice, Cold-Pressed Sesame Oil, Curry Leaves',
   90, TRUE, 'c1000000-0000-0000-0000-000000000001'),

  -- Product 2: Amla Pickle
  ('p1000000-0000-0000-0000-000000000002', 'amla-pickle', 'Amla Pickle', 'Usirikaya Urugai',
   'Rich in Vitamin C', 'medium',
   'Plump Indian gooseberries pickled with mustard tempering in sesame oil. Sour, spicy, and loaded with Vitamin C.',
   '<p>Amla (Indian Gooseberry) is one of Ayurveda''s most celebrated ingredients. Our Amla Pickle honours this tradition using whole, fresh usirikaya, pickled with a mustard-curry leaf tempering in cold-pressed sesame oil. Each piece retains its firm texture and remarkable Vitamin C content.</p>',
   'Amla (Indian Gooseberry), Red Chilli Powder, Turmeric, Rock Salt, Mustard Seeds, Curry Leaves, Cold-Pressed Sesame Oil',
   120, TRUE, 'c1000000-0000-0000-0000-000000000002'),

  -- Product 3: Pulihora Gongura
  ('p1000000-0000-0000-0000-000000000003', 'pulihora-gongura', 'Pulihora Gongura', 'Gongura Pacchadi',
   'Rare & Traditional', 'spicy',
   'The iconic red-stem sorrel leaf pickle — Andhra''s soul food. Tangy, fiery, utterly irresistible.',
   '<p>If there is one thing that defines Andhra food culture, it is Gongura. The tart, vibrant red-stemmed sorrel leaf is grown throughout Andhra Pradesh and has been part of the cuisine for centuries. No Andhra wedding feast is complete without it.</p>',
   'Gongura Leaves (Red Stem), Red Chilli, Garlic, Mustard Seeds, Cumin, Fenugreek, Asafoetida, Rock Salt, Cold-Pressed Sesame Oil, Curry Leaves',
   60, TRUE, 'c1000000-0000-0000-0000-000000000001'),

  -- Product 4: Lemon Pickle
  ('p1000000-0000-0000-0000-000000000004', 'lemon-pickle', 'Lemon Pickle', 'Nimmakaya Urugai',
   'Classic Andhra Staple', 'medium',
   'The everyday classic. Small Indian lemons pickled until perfectly soft and intensely sour with a spicy kick.',
   '<p>There is a reason Lemon Pickle has been on every Andhra dining table for generations — it is the perfect balance of sour, salty, and spicy. We use small Indian lemons, sun-dried to intensify their natural citric acid before pickling in cold-pressed sesame oil.</p>',
   'Indian Lemons, Red Chilli Powder, Turmeric, Rock Salt, Mustard Seeds, Fenugreek Seeds, Asafoetida, Cold-Pressed Sesame Oil',
   180, FALSE, 'c1000000-0000-0000-0000-000000000002'),

  -- Product 5: Maamidi Allam
  ('p1000000-0000-0000-0000-000000000005', 'maamidi-allam', 'Maamidi Allam', 'Mango Ginger Pickle',
   'Best with Rice & Dosa', 'medium',
   'Raw mango meets fresh ginger in this uniquely layered Andhra pickle. Sweet, sour, spicy, and warming all at once.',
   '<p>Maamidi Allam is the pickle that surprises everyone who tries it. Raw mango brings tangy sourness while fresh ginger adds warmth and subtle sweetness. The result is a four-flavour experience — sour, sweet, spicy, warm — all in a single jar. Best made in April–June at peak mango season.</p>',
   'Raw Mango, Fresh Ginger, Red Chilli Powder, Turmeric, Rock Salt, Mustard Seeds, Jaggery, Fenugreek, Cold-Pressed Sesame Oil, Curry Leaves',
   90, TRUE, 'c1000000-0000-0000-0000-000000000002'),

  -- Product 6: Red Chilli Pickle
  ('p1000000-0000-0000-0000-000000000006', 'red-chilli-pickle', 'Red Chilli Pickle', 'Mirapakaya Urugai',
   'Best with Rice', 'spicy',
   'Whole Guntur red chillies pickled in sesame oil. Pure heat, pure Andhra. For those who can take it.',
   '<p>Guntur, Andhra Pradesh, produces some of India''s most famous red chillies. Our Red Chilli Pickle celebrates them in their most unapologetic form — whole, plump Guntur chillies slit, marinated, and slow-pickled in cold-pressed sesame oil until meltingly tender.</p>',
   'Guntur Red Chillies, Turmeric, Rock Salt, Mustard Seeds, Fenugreek Seeds, Asafoetida, Garlic, Cold-Pressed Sesame Oil',
   120, FALSE, 'c1000000-0000-0000-0000-000000000001')

ON CONFLICT (slug) DO NOTHING;


-- ─── 8.3  Product Variants ───────────────────────────────────────────────
-- All prices in PAISE. ₹180 = 18000, ₹320 = 32000, etc.

INSERT INTO product_variants (product_id, weight_grams, label, sku, price, stock_quantity, low_stock_threshold) VALUES
  -- Drumstick Pickle: ₹180 / ₹320
  ('p1000000-0000-0000-0000-000000000001', 250, '250g', 'MF-DRUM-250',   18000, 50, 10),
  ('p1000000-0000-0000-0000-000000000001', 500, '500g', 'MF-DRUM-500',   32000, 30, 8),
  -- Amla Pickle: ₹160 / ₹290
  ('p1000000-0000-0000-0000-000000000002', 250, '250g', 'MF-AMLA-250',   16000, 45, 10),
  ('p1000000-0000-0000-0000-000000000002', 500, '500g', 'MF-AMLA-500',   29000, 25, 8),
  -- Pulihora Gongura: ₹200 / ₹370
  ('p1000000-0000-0000-0000-000000000003', 250, '250g', 'MF-GONG-250',   20000, 35, 10),
  ('p1000000-0000-0000-0000-000000000003', 500, '500g', 'MF-GONG-500',   37000, 20, 8),
  -- Lemon Pickle: ₹150 / ₹270
  ('p1000000-0000-0000-0000-000000000004', 250, '250g', 'MF-LEMON-250',  15000, 60, 12),
  ('p1000000-0000-0000-0000-000000000004', 500, '500g', 'MF-LEMON-500',  27000, 40, 10),
  -- Maamidi Allam: ₹190 / ₹350
  ('p1000000-0000-0000-0000-000000000005', 250, '250g', 'MF-MAAM-250',   19000, 40, 10),
  ('p1000000-0000-0000-0000-000000000005', 500, '500g', 'MF-MAAM-500',   35000, 22, 8),
  -- Red Chilli Pickle: ₹170 / ₹310
  ('p1000000-0000-0000-0000-000000000006', 250, '250g', 'MF-RCHILI-250', 17000, 35, 10),
  ('p1000000-0000-0000-0000-000000000006', 500, '500g', 'MF-RCHILI-500', 31000, 20, 8)
ON CONFLICT (sku) DO NOTHING;


-- ─── 8.4  Default Admin User ─────────────────────────────────────────────
-- ⚠️  REPLACE the password_hash with a real bcrypt hash before deploying!
-- Generate: node -e "require('bcryptjs').hash('YourPassword',10).then(console.log)"

INSERT INTO admin_users (email, password_hash, role) VALUES (
  'admin@maaflavours.com',
  '$2b$10$REPLACE_THIS_HASH_BEFORE_DEPLOYING_TO_PRODUCTION_!!!!!!',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;


-- ─── 8.5  Default Coupons ────────────────────────────────────────────────

INSERT INTO coupons (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, is_active) VALUES
  ('WELCOME50',    '₹50 off first order (new customers)',    'flat',         5000,  29900, NULL,  NULL, TRUE),
  ('MAASPECIAL',   '10% off orders above ₹599',             'percent',        10,  59900, 15000,  500, TRUE),
  ('FREESHIP',     'Free shipping on any order',            'free_shipping',    1,   NULL, NULL,   200, TRUE),
  ('FESTIVE15',    '15% off — Festival special (capped ₹200)', 'percent',      15,  39900, 20000,  100, FALSE)
ON CONFLICT (code) DO NOTHING;


-- ─── 8.6  Default Settings ───────────────────────────────────────────────

INSERT INTO settings (key, value, description) VALUES

  ('site', '{
    "name": "Maa Flavours",
    "tagline": "Authentic Andhra Taste — The Way Maa Made It",
    "email": "support@maaflavours.com",
    "phone": "+919876543210",
    "whatsapp": "+919876543210",
    "address": "Ongole, Andhra Pradesh, India — 523001",
    "fssai_status": "application_in_progress",
    "gstin": null
  }', 'General site information'),

  ('shipping', '{
    "free_shipping_threshold": 49900,
    "flat_shipping_charge": 6000,
    "cod_charge": 3000,
    "cod_available": true,
    "estimated_days_metro": "4-5",
    "estimated_days_standard": "5-7",
    "estimated_days_remote": "7-10"
  }', 'Shipping config. All monetary values in paise.'),

  ('tax', '{
    "cgst_rate": 6,
    "sgst_rate": 6,
    "igst_rate": 12,
    "hsn_code": "2001",
    "description": "Pickles prepared from vegetable matter — 12% GST (HSN 2001)"
  }', 'GST configuration for pickle products'),

  ('social', '{
    "instagram": "https://instagram.com/maaflavours",
    "facebook": "https://facebook.com/maaflavours",
    "youtube": "https://youtube.com/@maaflavours"
  }', 'Social media profile URLs'),

  ('notifications', '{
    "order_placed_sms": true,
    "order_confirmed_sms": true,
    "order_dispatched_sms": true,
    "order_delivered_sms": true,
    "newsletter_welcome_email": true
  }', 'Customer notification preferences'),

  ('announcement_bar', '{
    "text": "Free Shipping on orders above ₹499 | Pan-India Delivery | No Preservatives",
    "is_active": true,
    "bg_color": "#C0272D",
    "text_color": "#E8B84B"
  }', 'Homepage announcement bar configuration'),

  ('homepage_reviews', '{
    "show_count": 8,
    "min_rating": 4,
    "featured_only": false
  }', 'Homepage reviews section configuration')

ON CONFLICT (key) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 9 — STORAGE BUCKETS (Reference — create via Dashboard or CLI)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Create these in Supabase Dashboard → Storage → New Bucket:
--
-- Bucket: "product-images"
--   Public: YES
--   File size limit: 5 MB
--   Allowed types: image/jpeg, image/png, image/webp
--   Path: products/{product-slug}/{filename}
--
-- Bucket: "blog-images"
--   Public: YES
--   File size limit: 5 MB
--   Allowed types: image/jpeg, image/png, image/webp
--   Path: blog/{post-slug}/{filename}
--
-- Bucket: "receipts"
--   Public: NO (admin access only)
--   File size limit: 10 MB
--   Allowed types: image/jpeg, image/png, application/pdf
--   Path: receipts/{YYYY}/{MM}/{expense-id}
--
-- Bucket: "admin-uploads"
--   Public: NO (temporary upload staging area)
--   File size limit: 20 MB
--   Auto-delete: 24 hours
--
-- ═══════════════════════════════════════════════════════════════════════════
-- END OF SCHEMA — Maa Flavours v2.0 — July 2025
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Stock Adjustments (Inventory History) ──────────────────────────────────
-- Records every stock change with reason, old/new quantity, and who made it
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id      UUID        NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  product_name    TEXT,                          -- denormalised for quick display
  variant_label   TEXT,                          -- denormalised
  adjustment_type TEXT        NOT NULL CHECK (adjustment_type IN (
                                'received',       -- new stock received
                                'sold',           -- order fulfilled (auto)
                                'manual_set',     -- admin manually set qty
                                'manual_add',     -- admin added stock
                                'manual_remove',  -- admin removed stock
                                'damaged',        -- items damaged
                                'returned',       -- customer return
                                'correction'      -- stock count correction
                              )),
  qty_before      INT         NOT NULL DEFAULT 0,
  qty_change      INT         NOT NULL,           -- positive = add, negative = remove
  qty_after       INT         NOT NULL,
  note            TEXT,
  reference_id    UUID,                          -- e.g. order_id for 'sold'
  created_by      TEXT        NOT NULL DEFAULT 'admin',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_adj_variant   ON stock_adjustments(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_adj_created   ON stock_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_adj_type      ON stock_adjustments(adjustment_type);

-- RLS: admin-only
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_adjustments_admin_all" ON stock_adjustments
  FOR ALL USING (auth.role() = 'service_role');
