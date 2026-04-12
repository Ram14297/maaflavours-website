-- supabase/migrations/003_product_type.sql
-- Add product_type column to distinguish pickles from spice powders (podi)

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'pickle'
  CHECK (product_type IN ('pickle', 'powder'));

-- Fast filtering index
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
