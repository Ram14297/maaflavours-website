-- Migration 010: Restock notifications
-- Stores customer email addresses who want to be notified when a sold-out
-- product comes back in stock. When admin adds stock via inventory adjust,
-- all pending notifications for that product are emailed automatically.

CREATE TABLE IF NOT EXISTS restock_notifications (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_slug TEXT        NOT NULL,
  product_name TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  notified_at  TIMESTAMPTZ,                    -- NULL = not yet notified
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_slug, email)                 -- one registration per product per email
);

CREATE INDEX IF NOT EXISTS idx_restock_product_slug
  ON restock_notifications (product_slug)
  WHERE notified_at IS NULL;
