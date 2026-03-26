-- QwikTransfers Production Database Synchronization Script
-- Target Environment: PostgreSQL (Coolify)
-- Includes: Complaints table creation, Users name field split, and data migration logic.

BEGIN;

-- 1. Create enum for Complaints status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Complaints_status') THEN
        CREATE TYPE "enum_Complaints_status" AS ENUM ('open', 'resolved', 'closed');
    END IF;
END
$$;

-- 2. Create Complaints table
CREATE TABLE IF NOT EXISTS "Complaints" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "transaction_id" INTEGER,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "enum_Complaints_status" DEFAULT 'open',
    "attachment_url" VARCHAR(255),
    "admin_response" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Update Users table schema for Name Split
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "first_name" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "middle_name" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "last_name" VARCHAR(255);

-- 4. Migrate existing full_name data to new columns
-- Logic: 
-- - 1 part: first_name
-- - 2 parts: first_name, last_name
-- - 3+ parts: first_name, middle_name, last_name (includes all remaining parts)
UPDATE "Users"
SET 
    "first_name" = split_part(trim(regexp_replace("full_name", '\s+', ' ', 'g')), ' ', 1),
    "middle_name" = CASE 
        WHEN array_length(regexp_split_to_array(trim(regexp_replace("full_name", '\s+', ' ', 'g')), ' '), 1) >= 3 
        THEN split_part(trim(regexp_replace("full_name", '\s+', ' ', 'g')), ' ', 2)
        ELSE NULL 
    END,
    "last_name" = CASE 
        WHEN array_length(regexp_split_to_array(trim(regexp_replace("full_name", '\s+', ' ', 'g')), ' '), 1) = 2
        THEN split_part(trim(regexp_replace("full_name", '\s+', ' ', 'g')), ' ', 2)
        WHEN array_length(regexp_split_to_array(trim(regexp_replace("full_name", '\s+', ' ', 'g')), ' '), 1) >= 3
        THEN (
            SELECT string_agg(part, ' ')
            FROM (
                SELECT unnest(regexp_split_to_array(trim(regexp_replace("full_name", '\s+', ' ', 'g')), ' ')) AS part,
                       generate_series(1, array_length(regexp_split_to_array(trim(regexp_replace("full_name", '\s+', ' ', 'g')), ' '), 1)) AS i
            ) s
            WHERE i >= 3
        )
        ELSE NULL
    END
WHERE ("first_name" IS NULL OR "first_name" = '') AND "full_name" IS NOT NULL;

-- 5. Optional: Remove old full_name column 
-- Only run this AFTER you have verified that the names have been split correctly.
-- ALTER TABLE "Users" DROP COLUMN "full_name";

COMMIT;
