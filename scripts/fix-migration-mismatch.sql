-- Fix the migration name mismatch in production

-- Update the migration record to match your local files
UPDATE _prisma_migrations 
SET migration_name = '20250829_optimize_indexes'
WHERE migration_name = '20250823_optimize_indexes';

-- Mark the pending_outcome migration as applied
INSERT INTO _prisma_migrations (id, checksum, migration_name, finished_at, started_at, applied_steps_count) 
VALUES ('pending-fix', 'manual', '20250828_add_pending_outcome', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;

-- Ensure PENDING enum value exists
DO $$ 
BEGIN
    IF NOT 'PENDING' = ANY(enum_range(NULL::"PickOutcome")) THEN
        ALTER TYPE "PickOutcome" ADD VALUE 'PENDING';
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT 'Migration records fixed!' as status;