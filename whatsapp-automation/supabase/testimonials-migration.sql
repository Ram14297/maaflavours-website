-- ────────────────────────────────────────────────────────────────
-- Maa Flavours — Testimonials table
-- Run in Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS testimonials (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT        NOT NULL,
  city         TEXT        NOT NULL,
  rating       SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review       TEXT        NOT NULL,
  product      TEXT,                        -- which pickle they bought
  source       TEXT        DEFAULT 'direct' CHECK (source IN ('google', 'whatsapp', 'direct')),
  google_review_id TEXT,                   -- for future Google Places API sync
  is_featured  BOOLEAN     DEFAULT TRUE,
  is_approved  BOOLEAN     DEFAULT TRUE,
  sort_order   SMALLINT    DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Allow anyone to READ approved testimonials (for website display)
CREATE POLICY "Public can read approved testimonials"
  ON testimonials FOR SELECT
  USING (is_approved = TRUE);

-- Only service role can INSERT / UPDATE / DELETE
-- (admin uses service key — bypasses RLS automatically)

-- ─── Seed data — initial customer testimonials ───────────────────
INSERT INTO testimonials (name, city, rating, review, product, source, sort_order) VALUES
  (
    'Surekha Reddy',
    'Hyderabad',
    5,
    'I''ve been searching for a gongura pickle that tastes exactly like what my grandmother used to make. Maa Flavours nailed it — the balance of sour and spice is perfect. Ordered three packs already!',
    'Pulihora Gongura',
    'direct',
    1
  ),
  (
    'Venkat Rao',
    'Bangalore',
    5,
    'Living in Bangalore and missing Andhra food is real. This drumstick pickle solves that problem completely. The oil is fragrant, the drumstick texture is spot on. Highly recommend to everyone!',
    'Drumstick Pickle',
    'direct',
    2
  ),
  (
    'Priya Naidu',
    'Chennai',
    5,
    'The lemon pickle is tangy perfection. You can tell it''s made with love — the spices are balanced beautifully, not too salty, not too oily. Exactly how Maa used to make it back home.',
    'Lemon Pickle',
    'whatsapp',
    3
  ),
  (
    'Ramesh Babu',
    'Pune',
    5,
    'Maamidi Allam with hot dosa is heaven! The sweet-spicy balance is incredible. My kids devour it. We''ve gifted packs to relatives visiting from abroad and everyone wants to order online now.',
    'Maamidi Allam',
    'direct',
    4
  ),
  (
    'Kavitha Sharma',
    'Mumbai',
    5,
    'The amla pickle is absolutely delicious. You can taste the freshness — zero artificial smell or taste. Just pure homemade goodness delivered right to my door. Will be a regular customer for sure.',
    'Amla Pickle',
    'whatsapp',
    5
  ),
  (
    'Anjali Devi',
    'Delhi',
    5,
    'For someone who loves spicy food, this red chilli pickle is a dream. Packs serious heat but with amazing flavour depth. Pairs perfectly with curd rice. Cannot stop ordering — already on my 4th pack!',
    'Red Chilli Pickle',
    'direct',
    6
  ),
  (
    'Srinivas Kumar',
    'Vizag',
    5,
    'Ordered the gongura and drumstick combo pack. Both outstanding. The packaging is secure, arrived fresh. The taste genuinely reminds me of pickles from our native village. Brilliant work by Maa Flavours!',
    'Pulihora Gongura',
    'whatsapp',
    7
  ),
  (
    'Lakshmi Prasad',
    'Tirupati',
    5,
    'Pure vegetarian, no artificial preservatives — exactly what I was looking for. The lemon pickle has that authentic Andhra sting. My husband who is very particular about food quality absolutely loved it.',
    'Lemon Pickle',
    'direct',
    8
  );
