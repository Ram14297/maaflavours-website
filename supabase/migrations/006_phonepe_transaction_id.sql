-- 006_phonepe_transaction_id.sql
-- Maa Flavours — Add a dedicated column for PhonePe transaction IDs.
--
-- Background: phonepe-callback was previously stuffing the PhonePe
-- transaction ID into orders.razorpay_order_id (re-purposing a Razorpay
-- field). That worked but made the schema confusing and made it impossible
-- to look at an order and tell which gateway processed it without parsing
-- the value. This migration:
--   1. Adds a proper phonepe_transaction_id column
--   2. Backfills existing PhonePe orders (payment_method='phonepe' or
--      'phonepe_qr') by copying razorpay_order_id → phonepe_transaction_id
--      where razorpay_order_id is set
--   3. Leaves razorpay_order_id alone for backward compatibility — the
--      route reads/writes the new column going forward.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS phonepe_transaction_id text;

-- Backfill: any PhonePe-method orders that have a value in the (mis-used)
-- razorpay_order_id column should be copied to the proper column.
UPDATE orders
   SET phonepe_transaction_id = razorpay_order_id
 WHERE payment_method IN ('phonepe', 'phonepe_qr')
   AND razorpay_order_id IS NOT NULL
   AND phonepe_transaction_id IS NULL;

-- Helpful index for support lookups
CREATE INDEX IF NOT EXISTS idx_orders_phonepe_transaction_id
  ON orders (phonepe_transaction_id)
  WHERE phonepe_transaction_id IS NOT NULL;
