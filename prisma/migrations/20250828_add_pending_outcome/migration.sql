-- AlterEnum
-- Add PENDING value to PickOutcome enum
ALTER TYPE "PickOutcome" ADD VALUE IF NOT EXISTS 'PENDING';