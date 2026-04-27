-- 005_atomic_stock_decrement.sql
-- Maa Flavours — Atomic stock decrement RPC
--
-- Replaces the read-then-write stock decrement that lived in the Cashfree
-- webhook and create-order routes. Without this, two concurrent orders for
-- the same SKU could both read the same starting stock and both write the
-- same "after" value, overselling.
--
-- Usage from a route:
--   await supabase.rpc("decrement_variant_stock", {
--     p_variant_id: <uuid>,
--     p_quantity:   <int>,
--   });
--
-- Returns the resulting stock_quantity (clamped at 0 — never negative).
-- The single UPDATE statement holds a row lock for its entire duration,
-- so concurrent calls are serialised and stock cannot oversell.

CREATE OR REPLACE FUNCTION decrement_variant_stock(
  p_variant_id uuid,
  p_quantity   integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_stock integer;
BEGIN
  IF p_quantity IS NULL OR p_quantity < 1 THEN
    RAISE EXCEPTION 'p_quantity must be >= 1';
  END IF;

  UPDATE product_variants
     SET stock_quantity = GREATEST(0, stock_quantity - p_quantity),
         updated_at     = NOW()
   WHERE id = p_variant_id
  RETURNING stock_quantity INTO new_stock;

  IF new_stock IS NULL THEN
    RAISE EXCEPTION 'variant % not found', p_variant_id;
  END IF;

  RETURN new_stock;
END;
$$;

-- Grant execute to the service role only — customer-facing routes use the
-- service-role client, so this is sufficient. If you switch to anon-key
-- writes, also grant to authenticated.
REVOKE ALL ON FUNCTION decrement_variant_stock(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION decrement_variant_stock(uuid, integer) TO service_role;
