-- supabase/migrations/004_product_descriptions.sql
-- Maa Flavours — Final product content: short description, full description, ingredients
-- Run in Supabase SQL Editor

-- ─── 1. Drumstick Pickle ─────────────────────────────────────────────────────
-- Ingredients: Drumstick Pieces, Groundnut Oil, Tamarind, Red Chilli Powder, Salt, Mustard Seeds, Asafoetida, Fenugreek Powder
UPDATE products SET
  short_description = 'Tender drumstick pieces slow-cured in groundnut oil with tamarind and Andhra spices. A hearty, tangy side for hot rice.',
  description = '<p>Our Drumstick Pickle brings together fresh, tender drumstick pieces with a bold tamarind-based Andhra spice blend. The tartness of tamarind, the heat of red chilli powder, and the earthy warmth of fenugreek and mustard come together in groundnut oil to create a deeply flavourful pickle.</p><p>Made the way Maa always made it — in small batches, with patience, and without a single preservative. Best enjoyed with hot steamed rice, a drizzle of ghee, or as a side to curd rice and dal.</p>',
  ingredients = 'Drumstick Pieces, Groundnut Oil, Tamarind, Red Chilli Powder, Salt, Mustard Seeds, Asafoetida, Fenugreek Powder'
WHERE slug = 'drumstick-pickle';

-- ─── 2. Mango Ginger Pickle ──────────────────────────────────────────────────
-- Ingredients: Mango Ginger, Groundnut Oil, Jaggery, Tamarind, Red Chilli Powder, Salt
UPDATE products SET
  name = 'Mango Ginger Pickle',
  short_description = 'Mango ginger slow-cooked with jaggery and tamarind — a beautifully balanced sweet, sour and spicy pickle unlike any other.',
  description = '<p>Mango Ginger (Curcuma amada) is one of the most unique rhizomes in Indian cooking — it looks like ginger but carries a natural mango-like fragrance that is impossible to replicate. We combine it with jaggery for sweetness, tamarind for sourness, and red chilli for heat to create a pickle that hits every note at once.</p><p>Sweet, sour, spicy, and aromatic — this is the pickle that people reach for again and again without knowing exactly why. It pairs brilliantly with dosa, idli, curd rice, or hot rice with ghee. A truly special recipe from Maa''s kitchen.</p>',
  ingredients = 'Mango Ginger, Groundnut Oil, Jaggery, Tamarind, Red Chilli Powder, Salt'
WHERE slug = 'maamidi-allam';

-- ─── 4. Lemon Pickle ─────────────────────────────────────────────────────────
-- Ingredients: Lemon, Red Chilli Powder, Salt, Lemon Juice, Turmeric, Fenugreek Powder
UPDATE products SET
  short_description = 'Lemon quarters marinated in their own juice with red chilli, turmeric and fenugreek. Pure, tangy and completely oil-free.',
  description = '<p>Our Lemon Pickle is made the traditional way — no oil, no shortcuts. Fresh lemon quarters are packed in their own lemon juice with red chilli, salt, turmeric, and fenugreek powder, then left to slowly cure until the skin softens and the flavours deepen into something truly special.</p><p>The absence of oil makes this pickle lighter and brighter than most — sharp, tangy, and clean on the palate. It cuts through heavy food, lifts a plain rice meal, and keeps well for months. A staple that belongs in every kitchen.</p>',
  ingredients = 'Lemon, Red Chilli Powder, Salt, Lemon Juice, Turmeric, Fenugreek Powder'
WHERE slug = 'lemon-pickle';

-- ─── 5. Red Chilli Pickle ────────────────────────────────────────────────────
-- Ingredients: Red Chilli, Groundnut Oil, Salt, Tamarind
UPDATE products SET
  short_description = 'Whole red chillies preserved in groundnut oil and tamarind. Just four ingredients — bold, fiery and unapologetically Andhra.',
  description = '<p>Four ingredients. That is all. Whole red chillies, groundnut oil, salt, and tamarind — preserved together until the chilli softens and the tamarind adds a subtle sour depth that balances the fire. This is minimalist Andhra pickling at its finest.</p><p>There are no distractions here — just the pure, raw power of red chilli elevated by tamarind''s gentle tang. A small piece on the side of your rice plate is all it takes to transform an ordinary meal into something unforgettable. Not for the faint-hearted.</p>',
  ingredients = 'Red Chilli, Groundnut Oil, Salt, Tamarind',
  spice_level = 'extra-hot'
WHERE slug = 'red-chilli-pickle';

-- ─── 6. Pulihora Gongura Pickle ──────────────────────────────────────────────
-- Ingredients: Gongura (Sorrel Leaves), Groundnut Oil, Salt, Tamarind, Red Chilli Powder, Garlic, Fenugreek Powder, Mustard Seeds
UPDATE products SET
  short_description = 'Fresh sorrel leaves cooked down with tamarind, garlic and red chilli in groundnut oil. The soul of Andhra cuisine in a jar.',
  description = '<p>Gongura is the heart of Andhra cooking — its sharp, natural sourness is unlike anything else. We take fresh sorrel leaves and slow-cook them in groundnut oil with tamarind, garlic, red chilli, fenugreek, and mustard seeds until they form a thick, deeply aromatic paste. The double sourness of gongura and tamarind, tempered by garlic''s warmth, creates a condiment of extraordinary depth.</p><p>Mix a spoonful into hot rice with ghee and you will understand immediately why this pickle is an emotion for every Telugu household. Rare to find outside Andhra. Unmistakably authentic from within it.</p>',
  ingredients = 'Gongura (Sorrel Leaves), Groundnut Oil, Salt, Tamarind, Red Chilli Powder, Garlic, Fenugreek Powder, Mustard Seeds'
WHERE slug = 'pulihora-gongura';

-- ─── 7. Aavakaaya ────────────────────────────────────────────────────────────
-- Ingredients: Raw Mango, Groundnut Oil, Salt, Red Chilli Powder, Mustard Powder, Fenugreek Seeds
UPDATE products SET
  short_description = 'Raw mango pieces marinated in mustard powder and red chilli — the most iconic pickle of Andhra Pradesh.',
  description = '<p>Aavakaaya is the pickle that defines Andhra cuisine. Raw unripe mango pieces — cut thick, with the seed intact — are packed in groundnut oil with freshly ground mustard powder, Guntur red chilli, rock salt, and fenugreek seeds. It is a recipe that has not changed in generations, because it does not need to.</p><p>The sharp bite of raw mango, the pungency of mustard, the heat of red chilli — all preserved in groundnut oil until they become one. Serve it with hot rice and ghee, or with curd rice on a simple afternoon, and you will understand why every Telugu person calls it home.</p>',
  ingredients = 'Raw Mango, Groundnut Oil, Salt, Red Chilli Powder, Mustard Powder, Fenugreek Seeds'
WHERE slug = 'aavakaaya';

-- Verify all updates
SELECT slug, name, LEFT(short_description, 70) AS short_desc, LEFT(ingredients, 70) AS ingredients
FROM products
WHERE slug IN ('drumstick-pickle','pulihora-gongura','lemon-pickle','maamidi-allam','red-chilli-pickle','aavakaaya')
ORDER BY name;
