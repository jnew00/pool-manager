-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."GameStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "public"."GameStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "public"."games" ADD COLUMN     "status" "public"."GameStatus" NOT NULL DEFAULT 'SCHEDULED';
