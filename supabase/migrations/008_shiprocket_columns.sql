-- Migration 008: Add Shiprocket order tracking columns to orders table
-- These store Shiprocket's internal IDs so we can link back to Shiprocket
-- from the admin panel without re-entering order details manually.
--
-- shiprocket_order_id   — Shiprocket's numeric order ID (returned by /orders/create/adhoc)
-- shiprocket_shipment_id — Shiprocket's shipment ID (used for AWB assignment)
-- The AWB number goes into the existing tracking_id column.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shiprocket_order_id    BIGINT,
  ADD COLUMN IF NOT EXISTS shiprocket_shipment_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_order_id
  ON orders (shiprocket_order_id)
  WHERE shiprocket_order_id IS NOT NULL;
