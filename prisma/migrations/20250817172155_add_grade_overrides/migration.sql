-- CreateTable
CREATE TABLE "grade_overrides" (
    "id" TEXT NOT NULL,
    "pickId" TEXT NOT NULL,
    "originalOutcome" "PickOutcome" NOT NULL,
    "originalPoints" DECIMAL(65,30) NOT NULL,
    "newOutcome" "PickOutcome" NOT NULL,
    "newPoints" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "overriddenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overriddenBy" TEXT,

    CONSTRAINT "grade_overrides_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "grade_overrides" ADD CONSTRAINT "grade_overrides_pickId_fkey" FOREIGN KEY ("pickId") REFERENCES "picks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
