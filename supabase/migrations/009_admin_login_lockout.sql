-- Migration 009: Admin login rate-limiting columns
-- Adds DB-backed brute-force protection to admin_users so lockouts survive
-- serverless cold starts (in-memory Map is reset on every new function instance).
--
-- failed_login_count — incremented on each wrong password; reset on success
-- locked_until       — NULL = not locked; set to future timestamp after MAX_ATTEMPTS

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS failed_login_count INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until       TIMESTAMPTZ;
