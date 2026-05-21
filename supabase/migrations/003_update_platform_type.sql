-- Run this in Supabase Dashboard > SQL Editor
-- Replaces 'steam' with 'pc' and adds 'switch' to platform_type enum.
-- PostgreSQL does not support dropping enum values directly, so the type is recreated.

-- Step 1: add new values to the existing enum
ALTER TYPE platform_type ADD VALUE IF NOT EXISTS 'pc';
ALTER TYPE platform_type ADD VALUE IF NOT EXISTS 'switch';

-- Step 2: migrate any existing 'steam' rows to 'pc'
UPDATE games SET platform = 'pc' WHERE platform = 'steam';

-- Step 3: recreate the enum without 'steam'
-- Drop default so we can swap the column type
ALTER TABLE games ALTER COLUMN platform DROP DEFAULT;

-- Create replacement enum
CREATE TYPE platform_type_new AS ENUM ('pc', 'xbox', 'playstation', 'switch', 'other');

-- Cast the column to the new type via text
ALTER TABLE games
  ALTER COLUMN platform TYPE platform_type_new
  USING platform::text::platform_type_new;

-- Swap the type name
DROP TYPE platform_type;
ALTER TYPE platform_type_new RENAME TO platform_type;

-- Restore the default
ALTER TABLE games ALTER COLUMN platform SET DEFAULT 'other';
