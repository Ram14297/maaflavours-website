-- Migration 002: Add Cashfree and PhonePe payment methods
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Extend payment_method_enum with new gateways
ALTER TYPE payment_method_enum ADD VALUE IF NOT EXISTS 'cashfree';
ALTER TYPE payment_method_enum ADD VALUE IF NOT EXISTS 'phonepe';
ALTER TYPE payment_method_enum ADD VALUE IF NOT EXISTS 'phonepe_qr';

-- 2. Add Cashfree-specific columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cashfree_order_id    TEXT UNIQUE;   -- MF_<uuid_no_dashes>
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cashfree_payment_id  TEXT UNIQUE;   -- cf_pay_xxx

-- 3. Indexes for fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_cf_oid ON orders (cashfree_order_id)   WHERE cashfree_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_cf_pid ON orders (cashfree_payment_id) WHERE cashfree_payment_id IS NOT NULL;
