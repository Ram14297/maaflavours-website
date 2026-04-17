-- supabase/migrations/004_product_descriptions.sql
-- Maa Flavours — Update product descriptions, short descriptions, and ingredients
-- Run this in the Supabase SQL Editor
-- Updates all 6 pickles: Drumstick, Amla, Pulihora Gongura, Lemon, Maamidi Allam, Red Chilli, Aavakaaya

-- ─── 1. Drumstick Pickle ─────────────────────────────────────────────────────
UPDATE products SET
  short_description = 'Fresh drumstick pieces slow-cured in sesame oil with Andhra spices. A timeless side for steamed rice and dal.',
  description = '<p>Made from tender drumsticks hand-picked from local Andhra farms, Munagakaya Pachhadi is one of the most cherished pickles in Telugu households. Each piece is carefully cleaned and marinated in cold-pressed sesame oil with freshly ground spices — the way Maa has always made it.</p><p>The subtle earthiness of drumstick meets the bold heat of Guntur red chilli and the nuttiness of sesame oil to create a pickle that is complex, aromatic, and deeply satisfying. Zero preservatives. Made in small batches. Best with hot steamed rice, curd rice, or alongside a simple dal.</p>',
  ingredients = 'Raw Drumstick (Munagakaya), Sesame Oil (Nuvvula Nune), Red Chilli Powder (Mirchi Podi), Salt (Uppu), Mustard Seeds (Avalu), Fenugreek Seeds (Menthulu), Turmeric (Pasupu), Garlic (Vellulli), Curry Leaves (Karivepaku), Asafoetida (Inguva)'
WHERE slug = 'drumstick-pickle';

-- ─── 2. Amla Pickle ──────────────────────────────────────────────────────────
UPDATE products SET
  short_description = 'Sun-dried Indian gooseberry in sesame oil — tangy, vitamin-rich, and beautifully spiced.',
  description = '<p>Amla, the powerhouse of Vitamin C, meets Andhra''s bold pickling tradition in this classic recipe. Our Amla Pickle uses fresh Indian gooseberries preserved in cold-pressed sesame oil with a fragrant blend of spices that intensifies beautifully over days.</p><p>The sour bite of amla, balanced with red chilli heat and the warmth of fenugreek, makes this a perfectly complex pickle — healthy, gut-friendly, and incredibly flavourful. A pack that belongs in every Indian kitchen.</p>',
  ingredients = 'Indian Gooseberry / Amla (Usirikaya), Sesame Oil (Nuvvula Nune), Red Chilli Powder (Mirchi Podi), Salt (Uppu), Mustard Seeds (Avalu), Fenugreek Seeds (Menthulu), Turmeric (Pasupu), Curry Leaves (Karivepaku), Asafoetida (Inguva)'
WHERE slug = 'amla-pickle';

-- ─── 3. Pulihora Gongura ─────────────────────────────────────────────────────
UPDATE products SET
  short_description = 'The iconic Andhra sorrel paste — sour, spiced, and deeply aromatic. The soul of every Telugu meal.',
  description = '<p>Gongura is to Andhra what butter is to France — irreplaceable. Our Pulihora Gongura is made from fresh sorrel leaves sourced from farms in Andhra Pradesh, slowly cooked down with garlic, red chillies, and sesame into a thick, intensely flavourful paste.</p><p>Mix it into hot rice with a spoonful of ghee and you will understand why Andhraites across the world carry it in their hearts. Rare to find outside the region, unmistakably authentic from within it. Handmade in small batches with zero preservatives.</p>',
  ingredients = 'Gongura / Sorrel Leaves (Gongura Aaku), Sesame Oil (Nuvvula Nune), Red Chilli Powder (Mirchi Podi), Garlic (Vellulli), Sesame Seeds (Nuvvulu), Mustard Seeds (Avalu), Salt (Uppu), Dry Red Chillies (Endu Mirchi), Turmeric (Pasupu), Curry Leaves (Karivepaku), Asafoetida (Inguva)'
WHERE slug = 'pulihora-gongura';

-- ─── 4. Lemon Pickle ─────────────────────────────────────────────────────────
UPDATE products SET
  short_description = 'Sun-kissed lemon quarters cured in spiced sesame oil. The timeless Andhra staple that completes every thali.',
  description = '<p>There is a reason Lemon Pickle has been on every Andhra dining table for generations — it is the one condiment that works with everything. Our Nimmakaya Urugai is made from thick-skinned, juicy lemons quarter-cut and slow-marinated in cold-pressed sesame oil with a blend of bold Andhra spices.</p><p>Over time, the lemon softens and the flavours deepen into something truly special — bright, tangy, and beautifully fragrant. A jar of this pickle elevates a simple papad lunch, completes a dal-rice thali, and brings the taste of Andhra home wherever you are. Shelf life of 6 months — it only gets better with age.</p>',
  ingredients = 'Lemon (Nimmakaya), Sesame Oil (Nuvvula Nune), Red Chilli Powder (Mirchi Podi), Rock Salt (Nattu Uppu), Mustard Seeds (Avalu), Fenugreek Seeds (Menthulu), Turmeric (Pasupu), Asafoetida (Inguva)'
WHERE slug = 'lemon-pickle';

-- ─── 5. Maamidi Allam ────────────────────────────────────────────────────────
UPDATE products SET
  short_description = 'Raw mango and fresh ginger pickle — sweet, tangy, and warmly spiced. A Maa Flavours signature.',
  description = '<p>Maamidi Allam is the pickle that surprises everyone the first time — the bold tang of raw green mango meets the earthy warmth of fresh ginger in a perfectly balanced Andhra spice blend. A touch of jaggery rounds out the flavours into something sweet, sour, and beautifully complex.</p><p>This is one of Maa''s most celebrated recipes — the one people request again and again. Pairs brilliantly with dosa, idli, upma, or simply spooned over hot rice. Handmade in small batches with no preservatives. No shortcuts.</p>',
  ingredients = 'Raw Mango (Maamidi Kaaya), Fresh Ginger (Allam), Sesame Oil (Nuvvula Nune), Red Chilli Powder (Mirchi Podi), Jaggery (Bellam), Mustard Seeds (Avalu), Salt (Uppu), Fenugreek Seeds (Menthulu), Turmeric (Pasupu), Curry Leaves (Karivepaku), Asafoetida (Inguva)'
WHERE slug = 'maamidi-allam';

-- ─── 6. Red Chilli Pickle ────────────────────────────────────────────────────
UPDATE products SET
  short_description = 'Whole Guntur red chillies preserved in golden sesame oil — fiery, fragrant, and unmistakably Andhra.',
  description = '<p>The Guntur red chilli is legendary in the spice world — known for its intense heat, deep red colour, and smoky fragrance. Our Mirapakaya Urugai celebrates this extraordinary ingredient in its purest form. Whole chillies are packed in cold-pressed sesame oil with mustard seeds, fenugreek, and asafoetida.</p><p>This is a pickle for the bold. One piece added to hot rice with a drizzle of ghee creates an experience that lingers. Spicy, aromatic, honest — made exactly the way it has been made in Andhra homes for generations. Handle with love. Serve with respect.</p>',
  ingredients = 'Red Chilli — Guntur Variety (Mirapakaya), Sesame Oil (Nuvvula Nune), Mustard Seeds (Avalu), Salt (Uppu), Fenugreek Seeds (Menthulu), Turmeric (Pasupu), Sesame Seeds (Nuvvulu), Asafoetida (Inguva)',
  spice_level = 'extra-hot'
WHERE slug = 'red-chilli-pickle';

-- ─── 7. Aavakaaya (admin-added) ──────────────────────────────────────────────
UPDATE products SET
  short_description = 'The pride of Andhra — raw mango pieces in bold mustard-chilli masala. Every Telugu household''s most beloved pickle.',
  description = '<p>Aavakaaya is not just a pickle — it is the very identity of Andhra cuisine. Made from raw unripe mango pieces cut with the seed intact, marinated in freshly ground mustard powder, fiery Guntur red chilli, rock salt, and cold-pressed sesame oil. This is the recipe passed down through generations in Telugu households.</p><p>There is a reason every Telugu person lights up when they hear the word "Aavakaaya." It is comfort, it is home, it is tradition in a jar. Serve it with hot rice and ghee, or with a simple curd rice — and watch an ordinary meal become extraordinary.</p>',
  ingredients = 'Raw Mango (Maamidi Kaaya / Kairi), Sesame Oil (Nuvvula Nune), Red Chilli Powder — Guntur (Mirchi Podi), Mustard Powder (Avalu Podi), Rock Salt (Nattu Uppu), Fenugreek Seeds (Menthulu), Turmeric (Pasupu), Asafoetida (Inguva)'
WHERE slug = 'aavakaaya';

-- Verify updates
SELECT slug, LEFT(short_description, 60) AS short_desc_preview,
       LEFT(ingredients, 60) AS ingredients_preview
FROM products
WHERE slug IN ('drumstick-pickle','amla-pickle','pulihora-gongura','lemon-pickle','maamidi-allam','red-chilli-pickle','aavakaaya')
ORDER BY slug;
