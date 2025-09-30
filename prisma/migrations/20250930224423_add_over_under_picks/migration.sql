-- CreateEnum
CREATE TYPE "public"."OverUnderChoice" AS ENUM ('OVER', 'UNDER');

-- DropForeignKey
ALTER TABLE "public"."picks" DROP CONSTRAINT "picks_teamId_fkey";

-- AlterTable
ALTER TABLE "public"."picks" ADD COLUMN     "overUnderPick" "public"."OverUnderChoice",
ALTER COLUMN "teamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."picks" ADD CONSTRAINT "picks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
