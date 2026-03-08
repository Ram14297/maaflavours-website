-- ============================================================
-- supabase/rls.sql
-- Maa Flavours — Row Level Security (RLS) Policies
--
-- Run AFTER schema.sql and seed.sql
--
-- SECURITY MODEL:
--   Public (anon):        Can read products, variants, images,
--                         categories, approved reviews, published
--                         blog posts, active coupons
--   Authenticated (customer):
--                         All of above + own orders, own addresses,
--                         own profile, write reviews
--   Service role:         Full access (used by server-side API routes)
--   Admin users:          Managed via service role in API routes
--                         (not via RLS — admin login is server-side only)
--
-- NOTE: Admin panel operations must use SUPABASE_SERVICE_ROLE_KEY.
--       Never expose the service role key to the browser.
--       Customer auth uses Supabase anon key + JWT session.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE admin_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons              ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings             ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: auth.uid() returns the current customer's UUID
--         (matches customers.id which = auth.users.id)
-- ============================================================

-- ============================================================
-- admin_users
-- ZERO public access. Service role only.
-- ============================================================
DROP POLICY IF EXISTS "admin_users_no_public" ON admin_users;
CREATE POLICY "admin_users_no_public"
  ON admin_users FOR ALL
  TO public
  USING (FALSE);

-- ============================================================
-- categories
-- Public read (active only). No customer write.
-- ============================================================
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  TO public
  USING (is_active = TRUE);

-- ============================================================
-- products
-- Public read (active only). No customer write.
-- ============================================================
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read"
  ON products FOR SELECT
  TO public
  USING (is_active = TRUE);

-- ============================================================
-- product_variants
-- Public read (active only, active product only).
-- ============================================================
DROP POLICY IF EXISTS "variants_public_read" ON product_variants;
CREATE POLICY "variants_public_read"
  ON product_variants FOR SELECT
  TO public
  USING (
    is_active = TRUE
    AND EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_variants.product_id
        AND p.is_active = TRUE
    )
  );

-- ============================================================
-- product_images
-- Public read (for active products).
-- ============================================================
DROP POLICY IF EXISTS "images_public_read" ON product_images;
CREATE POLICY "images_public_read"
  ON product_images FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_images.product_id
        AND p.is_active = TRUE
    )
  );

-- ============================================================
-- customers
-- Customers can read + update their own record only.
-- New customer rows are created server-side via service role
-- (in the OTP verify API route).
-- ============================================================
DROP POLICY IF EXISTS "customers_self_read" ON customers;
CREATE POLICY "customers_self_read"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "customers_self_update" ON customers;
CREATE POLICY "customers_self_update"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT is handled by service role in /api/auth/verify — no customer insert policy needed.

-- ============================================================
-- customer_addresses
-- Customers can CRUD their own addresses only.
-- ============================================================
DROP POLICY IF EXISTS "addresses_own_select" ON customer_addresses;
CREATE POLICY "addresses_own_select"
  ON customer_addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "addresses_own_insert" ON customer_addresses;
CREATE POLICY "addresses_own_insert"
  ON customer_addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "addresses_own_update" ON customer_addresses;
CREATE POLICY "addresses_own_update"
  ON customer_addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "addresses_own_delete" ON customer_addresses;
CREATE POLICY "addresses_own_delete"
  ON customer_addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = customer_id);

-- ============================================================
-- coupons
-- Public can see is_active + code + type + value + min_order_amount
-- (enough to display "WELCOME50: ₹50 off on orders above ₹299").
-- Usage tracking (usage_count) is only updated via service role.
-- ============================================================
DROP POLICY IF EXISTS "coupons_public_read" ON coupons;
CREATE POLICY "coupons_public_read"
  ON coupons FOR SELECT
  TO public
  USING (
    is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- ============================================================
-- orders
-- Authenticated customers can:
--   INSERT their own orders (customer_id = auth.uid())
--   SELECT their own orders
-- No customer UPDATE or DELETE (orders are immutable from client).
-- Status updates go through service role in API routes.
-- ============================================================
DROP POLICY IF EXISTS "orders_own_select" ON orders;
CREATE POLICY "orders_own_select"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "orders_own_insert" ON orders;
CREATE POLICY "orders_own_insert"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

-- ============================================================
-- order_items
-- Customers can see items from their own orders.
-- ============================================================
DROP POLICY IF EXISTS "order_items_own_select" ON order_items;
CREATE POLICY "order_items_own_select"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.customer_id = auth.uid()
    )
  );

-- ============================================================
-- order_status_history
-- Customers can see history of their own orders.
-- ============================================================
DROP POLICY IF EXISTS "status_history_own_select" ON order_status_history;
CREATE POLICY "status_history_own_select"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id
        AND o.customer_id = auth.uid()
    )
  );

-- ============================================================
-- product_reviews
-- Public can read approved reviews.
-- Authenticated customers can INSERT one review per product.
-- Customers cannot UPDATE or DELETE their own reviews
-- (they can contact us to update — prevents gaming).
-- ============================================================
DROP POLICY IF EXISTS "reviews_public_read" ON product_reviews;
CREATE POLICY "reviews_public_read"
  ON product_reviews FOR SELECT
  TO public
  USING (is_approved = TRUE);

DROP POLICY IF EXISTS "reviews_own_read" ON product_reviews;
CREATE POLICY "reviews_own_read"
  ON product_reviews FOR SELECT
  TO authenticated
  USING (
    is_approved = TRUE
    OR customer_id = auth.uid()   -- can see own unapproved review
  );

DROP POLICY IF EXISTS "reviews_own_insert" ON product_reviews;
CREATE POLICY "reviews_own_insert"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = customer_id
    -- Prevent submitting reviews for products never purchased:
    -- (Optional strict enforcement — requires a verified_purchase check)
    -- AND EXISTS (
    --   SELECT 1 FROM order_items oi
    --   JOIN orders o ON o.id = oi.order_id
    --   WHERE oi.product_id = product_reviews.product_id
    --     AND o.customer_id = auth.uid()
    --     AND o.payment_status = 'paid'
    -- )
  );

-- ============================================================
-- otp_sessions
-- No public access. Managed entirely by server-side API routes
-- using service role key.
-- ============================================================
DROP POLICY IF EXISTS "otp_sessions_no_public" ON otp_sessions;
CREATE POLICY "otp_sessions_no_public"
  ON otp_sessions FOR ALL
  TO public
  USING (FALSE);

-- ============================================================
-- newsletter_subscribers
-- Anonymous INSERT (anyone can subscribe without logging in).
-- No public SELECT (subscriber list is private).
-- ============================================================
DROP POLICY IF EXISTS "newsletter_anon_insert" ON newsletter_subscribers;
CREATE POLICY "newsletter_anon_insert"
  ON newsletter_subscribers FOR INSERT
  TO public
  WITH CHECK (TRUE);            -- anyone can subscribe

-- No SELECT for public (email list is private)
DROP POLICY IF EXISTS "newsletter_no_public_select" ON newsletter_subscribers;
CREATE POLICY "newsletter_no_public_select"
  ON newsletter_subscribers FOR SELECT
  TO public
  USING (FALSE);

-- ============================================================
-- contact_messages
-- Anonymous INSERT (anyone can submit contact form).
-- No public SELECT.
-- ============================================================
DROP POLICY IF EXISTS "contact_anon_insert" ON contact_messages;
CREATE POLICY "contact_anon_insert"
  ON contact_messages FOR INSERT
  TO public
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "contact_no_public_select" ON contact_messages;
CREATE POLICY "contact_no_public_select"
  ON contact_messages FOR SELECT
  TO public
  USING (FALSE);

-- ============================================================
-- blog_posts
-- Public read (published only).
-- ============================================================
DROP POLICY IF EXISTS "blog_public_read" ON blog_posts;
CREATE POLICY "blog_public_read"
  ON blog_posts FOR SELECT
  TO public
  USING (is_published = TRUE);

-- ============================================================
-- expenses
-- No public access. Admin only via service role.
-- ============================================================
DROP POLICY IF EXISTS "expenses_no_public" ON expenses;
CREATE POLICY "expenses_no_public"
  ON expenses FOR ALL
  TO public
  USING (FALSE);

-- ============================================================
-- settings
-- Public SELECT for non-sensitive config keys.
-- Updates only via service role (admin panel API routes).
-- ============================================================
DROP POLICY IF EXISTS "settings_public_read" ON settings;
CREATE POLICY "settings_public_read"
  ON settings FOR SELECT
  TO public
  USING (
    -- Only expose non-sensitive settings to the public
    key IN (
      'shipping_free_threshold',
      'shipping_charge',
      'cod_charge',
      'delivery_days_min',
      'delivery_days_max',
      'business_name',
      'business_address',
      'business_email',
      'business_mobile',
      'whatsapp_number',
      'maintenance_mode'
    )
  );

-- ============================================================
-- STORAGE POLICIES
-- Bucket: "product-images" — public read
-- ============================================================

-- Create the bucket (run this manually in Supabase dashboard or via CLI)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('product-images', 'product-images', TRUE)
-- ON CONFLICT DO NOTHING;

-- Public read for product images
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Only service role can upload product images (from admin panel)
DROP POLICY IF EXISTS "product_images_service_insert" ON storage.objects;
CREATE POLICY "product_images_service_insert"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_service_delete" ON storage.objects;
CREATE POLICY "product_images_service_delete"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'product-images');

-- ============================================================
-- SECURITY SUMMARY
-- ============================================================
--
-- Public (anon key):
--   ✅ products         SELECT (is_active=TRUE)
--   ✅ product_variants SELECT (is_active=TRUE)
--   ✅ product_images   SELECT (for active products)
--   ✅ categories       SELECT (is_active=TRUE)
--   ✅ coupons          SELECT (is_active + not expired)
--   ✅ product_reviews  SELECT (is_approved=TRUE)
--   ✅ blog_posts       SELECT (is_published=TRUE)
--   ✅ newsletter_subs  INSERT only
--   ✅ contact_messages INSERT only
--   ✅ settings         SELECT (safe keys only)
--   ✅ storage objects  SELECT (product-images bucket)
--
-- Authenticated customer:
--   ✅ All public reads above
--   ✅ customers        SELECT/UPDATE own row
--   ✅ customer_addresses CRUD own rows
--   ✅ orders           SELECT own + INSERT (own customer_id)
--   ✅ order_items      SELECT own orders' items
--   ✅ order_status_history SELECT own orders' history
--   ✅ product_reviews  SELECT approved + own + INSERT
--
-- Service role (server-side API routes only):
--   ✅ Full access to ALL tables (bypasses RLS)
--   ✅ Use SUPABASE_SERVICE_ROLE_KEY in API routes
--   ❌ Never expose service role key to browser
--
-- ============================================================
-- END rls.sql
-- ============================================================
