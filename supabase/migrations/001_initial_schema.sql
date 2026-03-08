-- ═══════════════════════════════════════════════════════════════════════════
-- supabase/migrations/001_initial_schema.sql
-- Maa Flavours — Initial Migration
--
-- This is an IDEMPOTENT migration file — safe to run multiple times.
-- All CREATE TABLE uses IF NOT EXISTS. All INSERT uses ON CONFLICT DO NOTHING.
--
-- For Supabase CLI:
--   supabase migration new initial_schema
--   (paste contents of schema.sql here)
--   supabase db push
--
-- This file is identical to schema.sql but prefixed with migration metadata.
-- ═══════════════════════════════════════════════════════════════════════════

-- Migration metadata
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE 'Running Maa Flavours Migration 001 — Initial Schema';
  RAISE NOTICE 'Timestamp: %', NOW();
  RAISE NOTICE '═══════════════════════════════════════════════════';
END $$;

-- Include full schema (symlinked or copy-pasted from schema.sql)
-- \i schema.sql
--
-- OR: Paste the contents of schema.sql directly below this line.
-- The full schema is in supabase/schema.sql
