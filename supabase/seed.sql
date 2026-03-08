-- supabase/seed.sql
-- Maa Flavours — Initial Data Seed
-- Run this AFTER schema.sql in the Supabase SQL Editor
-- Safe to re-run: every INSERT uses ON CONFLICT DO NOTHING / DO UPDATE

-- ─── Admin User ───────────────────────────────────────────────────────────────
-- Password: Admin@123  (change after first login)
INSERT INTO admin_users (email, password_hash, role)
VALUES ('admin@maaflavours.com', '$2a$10$U.pygyHde8IGf8KhL5NXXeCOunAdO6wncukZunfoAzW/w9inxo1b6', 'super_admin')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;

-- ─── 6 Core Products ─────────────────────────────────────────────────────────
-- spice_level must be one of: 'mild' | 'medium' | 'spicy' | 'extra-hot'
INSERT INTO products (
  name, slug, spice_level, short_description,
  description, tag, is_active, is_featured
) VALUES
  ('Drumstick Pickle',  'drumstick-pickle',  'medium',
   'Authentic Andhra drumstick in traditional spice blend',
   'Made with fresh drumstick pieces slow-cured in mustard oil, red chillies, and our secret Andhra spice blend. This pickle pairs beautifully with hot rice and ghee. Every jar is handmade in small batches with no preservatives.',
   'Authentic Andhra Taste', true, true),

  ('Amla Pickle',       'amla-pickle',       'medium',
   'Sun-dried amla packed with Vitamin C and robust spices',
   'Whole amla (Indian gooseberry) sun-dried for 3 days then slow-cured in mustard oil with turmeric, fenugreek, and red chillies. Rich in Vitamin C and antioxidants. Best with curd rice or as a digestive aid.',
   'Rich in Vitamin C', true, true),

  ('Pulihora Gongura',  'pulihora-gongura',  'spicy',
   'Rare sorrel leaf pickle — a true Andhra heirloom recipe',
   'Gongura (sorrel leaves) are hard to find outside Andhra. We source fresh leaves from local farms, cook them down with mustard seeds, dry red chillies, and garlic into a thick, intensely flavourful paste. Rare and irreplaceable.',
   'Rare & Traditional', true, true),

  ('Lemon Pickle',      'lemon-pickle',      'medium',
   'Slow-cured lemon quarters in cold-pressed mustard oil',
   'Tender young lemons quarter-cut and slow-cured for 3 weeks in mustard oil with asafoetida, fenugreek, and red chilli. The result is a mellow, tangy, deeply flavoured pickle that is the backbone of any traditional Andhra meal.',
   'Classic Andhra Staple', true, true),

  ('Maamidi Allam',     'maamidi-allam',     'medium',
   'Young raw mango and ginger — sweet, tangy, and gently spiced',
   'A rare combination of unripe mango and fresh ginger cured together with jaggery, mustard seeds, and mild spices. Slightly sweet, tangy, and warming. The perfect accompaniment to dosa, idli, or curd rice.',
   'Best with Rice & Dosa', true, true),

  ('Red Chilli Pickle', 'red-chilli-pickle', 'extra-hot',
   'Whole fiery red chillies in golden sesame oil',
   'Whole Guntur red chillies — the pride of Andhra — packed in cold-pressed sesame oil with mustard seeds and asafoetida. This is not for the faint-hearted. One bite and you will understand why Andhra is the spice capital of India.',
   'Best with Rice', true, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Product Variants (250g + 500g for each product) ─────────────────────────
-- label is NOT NULL; discounted_price is NULL (no active discount)
INSERT INTO product_variants (product_id, weight_grams, label, sku, price, discounted_price, stock_quantity, low_stock_threshold)
SELECT
  p.id,
  v.weight_grams,
  v.weight_grams || 'g',
  p.slug || '-' || v.weight_grams || 'g',
  v.price,
  NULL,
  50,
  10
FROM products p
CROSS JOIN (VALUES
  (250, 18000),
  (500, 32000)
) AS v(weight_grams, price)
ON CONFLICT (sku) DO NOTHING;

-- ─── Default Settings ─────────────────────────────────────────────────────────
-- Keys must match ALLOWED_SECTIONS in src/app/api/admin/settings/route.ts:
-- business | shipping | payments | notifications | social | announcement
INSERT INTO settings (key, value) VALUES
  ('business', '{
    "name": "Maa Flavours",
    "tagline": "Authentic Andhra Taste — The Way Maa Made It",
    "email": "support@maaflavours.com",
    "phone": "",
    "address": "Ongole, Andhra Pradesh — 523001",
    "gstin": "",
    "fssai": "Application In Progress",
    "pincode": "523001"
  }'),
  ('shipping', '{
    "free_threshold": 49900,
    "standard_fee": 6000,
    "cod_extra": 3000,
    "tat_days": "5-7",
    "courier": "DTDC / Delhivery",
    "zones": [
      {"name": "Andhra Pradesh", "fee": 0, "tat": "2-3 days"},
      {"name": "South India", "fee": 4000, "tat": "3-5 days"},
      {"name": "Rest of India", "fee": 6000, "tat": "5-7 days"}
    ]
  }'),
  ('payments', '{
    "razorpay_key_id": "",
    "webhook_url": "https://maaflavours.com/api/checkout/webhook",
    "cod_enabled": true,
    "upi_enabled": true,
    "card_enabled": true,
    "netbanking_enabled": true
  }'),
  ('notifications', '{
    "order_placed": true,
    "order_shipped": true,
    "order_delivered": false,
    "low_stock": true,
    "daily_summary": false,
    "admin_whatsapp": "",
    "admin_email": ""
  }'),
  ('social', '{
    "instagram": "",
    "facebook": "",
    "youtube": "",
    "whatsapp_number": "",
    "meta_title": "Maa Flavours — Authentic Andhra Pickles",
    "meta_description": "Authentic Andhra homemade pickles from Ongole. No preservatives, traditional recipes."
  }'),
  ('announcement', '{
    "enabled": true,
    "text": "Free Shipping on orders above Rs.499 | Pan-India Delivery | No Preservatives"
  }')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ─── Sample Coupons ───────────────────────────────────────────────────────────
-- type must be one of: 'flat' | 'percent' | 'free_shipping'
INSERT INTO coupons (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, is_active)
VALUES
  ('WELCOME50',  'Rs.50 off first order',            'flat',         5000, 29900,  NULL, 500, true),
  ('MAASPECIAL', '10% off orders above Rs.599',      'percent',        10, 59900, 15000, 500, true),
  ('FREESHIP',   'Free shipping on any order',       'free_shipping',   1,  NULL,  NULL, 200, true)
ON CONFLICT (code) DO NOTHING;

-- ─── Verify counts ────────────────────────────────────────────────────────────
SELECT
  'products'      AS table_name, COUNT(*) AS rows FROM products
UNION ALL SELECT 'variants',     COUNT(*) FROM product_variants
UNION ALL SELECT 'admin_users',  COUNT(*) FROM admin_users
UNION ALL SELECT 'settings',     COUNT(*) FROM settings
UNION ALL SELECT 'coupons',      COUNT(*) FROM coupons
ORDER BY table_name;
