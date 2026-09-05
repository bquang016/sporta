-- ============================================================================
-- Migration: Add password_snooze_until column to users table
-- Date: 2026-08-31
-- Description: Allows owners to snooze the "change password" reminder by 1 or 3 days.
--              When snooze is active, the modal will not appear until the snooze expires.
-- ============================================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_snooze_until TIMESTAMP;

COMMENT ON COLUMN users.password_snooze_until IS 'Timestamp until which the change-password reminder is snoozed. NULL means no active snooze.';
