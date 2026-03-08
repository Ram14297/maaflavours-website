-- supabase/seed.sql
-- Maa Flavours — Initial Data Seed (Step 25)
-- Run this AFTER schema.sql in the Supabase SQL Editor

-- ─── Admin User ───────────────────────────────────────────────────────────────
INSERT INTO admin_users (email, role) 
VALUES ('admin@maaflavours.com', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- ─── 6 Core Products ─────────────────────────────────────────────────────────
INSERT INTO products (
  name, slug, spice_level, short_description,
  description, tag, is_active, is_featured, display_order
) VALUES
  ('Drumstick Pickle',  'drumstick-pickle',  'medium',
   'Authentic Andhra drumstick in traditional spice blend',
   'Made with fresh drumstick pieces slow-cured in mustard oil, red chillies, and our secret Andhra spice blend. This pickle pairs beautifully with hot rice and ghee. Every jar is handmade in small batches with no preservatives.',
   'Authentic Andhra Taste', true, true, 1),

  ('Amla Pickle',       'amla-pickle',       'medium',
   'Sun-dried amla packed with Vitamin C and robust spices',
   'Whole amla (Indian gooseberry) sun-dried for 3 days then slow-cured in mustard oil with turmeric, fenugreek, and red chillies. Rich in Vitamin C and antioxidants. Best with curd rice or as a digestive aid.',
   'Rich in Vitamin C', true, true, 2),

  ('Pulihora Gongura',  'pulihora-gongura',  'hot',
   'Rare sorrel leaf pickle — a true Andhra heirloom recipe',
   'Gongura (sorrel leaves) are hard to find outside Andhra. We source fresh leaves from local farms, cook them down with mustard seeds, dry red chillies, and garlic into a thick, intensely flavourful paste. Rare and irreplaceable.',
   'Rare & Traditional', true, true, 3),

  ('Lemon Pickle',      'lemon-pickle',      'medium',
   'Slow-cured lemon quarters in cold-pressed mustard oil',
   'Tender young lemons quarter-cut and slow-cured for 3 weeks in mustard oil with asafoetida, fenugreek, and red chilli. The result is a mellow, tangy, deeply flavoured pickle that is the backbone of any traditional Andhra meal.',
   'Classic Andhra Staple', true, true, 4),

  ('Maamidi Allam',     'maamidi-allam',     'medium',
   'Young raw mango and ginger — sweet, tangy, and gently spiced',
   'A rare combination of unripe mango and fresh ginger cured together with jaggery, mustard seeds, and mild spices. Slightly sweet, tangy, and warming. The perfect accompaniment to dosa, idli, or curd rice.',
   'Best with Rice & Dosa', true, true, 5),

  ('Red Chilli Pickle', 'red-chilli-pickle', 'hot',
   'Whole fiery red chillies in golden sesame oil',
   'Whole Guntur red chillies — the pride of Andhra — packed in cold-pressed sesame oil with mustard seeds and asafoetida. This is not for the faint-hearted. One bite and you will understand why Andhra is the spice capital of India.',
   'Best with Rice', true, true, 6)
ON CONFLICT (slug) DO NOTHING;

-- ─── Product Variants (250g + 500g for each product) ─────────────────────────
INSERT INTO product_variants (product_id, weight_grams, price, compare_at_price, sku, stock_quantity)
SELECT 
  p.id,
  v.weight_grams,
  v.price,
  v.compare_at_price,
  p.slug || '-' || v.weight_grams || 'g',
  50
FROM products p
CROSS JOIN (VALUES
  (250, 18000, 22000),
  (500, 32000, 38000)
) AS v(weight_grams, price, compare_at_price)
ON CONFLICT (sku) DO NOTHING;

-- ─── Default Settings ─────────────────────────────────────────────────────────
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
    "cod_enabled": true,
    "upi_enabled": true,
    "card_enabled": true,
    "netbanking_enabled": true,
    "webhook_url": "https://maaflavours.com/api/checkout/webhook"
  }'),
  ('notifications', '{
    "order_placed": true,
    "order_shipped": true,
    "order_delivered": false,
    "low_stock": true,
    "daily_summary": false
  }'),
  ('announcement', '{
    "enabled": true,
    "text": "Free Shipping on orders above Rs.499 | Pan-India Delivery | No Preservatives"
  }')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ─── Sample Coupon ────────────────────────────────────────────────────────────
INSERT INTO coupons (code, description, type, value, min_order_amount, usage_limit, is_active)
VALUES ('WELCOME50', 'Welcome offer — Rs.50 off first order', 'flat', 5000, 29900, 500, true)
ON CONFLICT (code) DO NOTHING;

-- ─── Verify counts ────────────────────────────────────────────────────────────
SELECT 
  'products'         AS table_name, COUNT(*) AS rows FROM products
UNION ALL SELECT 'variants',         COUNT(*) FROM product_variants
UNION ALL SELECT 'admin_users',      COUNT(*) FROM admin_users
UNION ALL SELECT 'settings',         COUNT(*) FROM settings
UNION ALL SELECT 'coupons',          COUNT(*) FROM coupons
ORDER BY table_name;
