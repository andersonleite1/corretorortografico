-- CreateTable
CREATE TABLE "bug_reports" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "additionalInfo" TEXT,
    "wantsNotification" BOOLEAN NOT NULL DEFAULT false,
    "notificationEmail" TEXT,
    "userId" TEXT,
    "userAgent" TEXT,
    "pageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',

    CONSTRAINT "bug_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bug_reports_createdAt_idx" ON "bug_reports"("createdAt");

-- CreateIndex
CREATE INDEX "bug_reports_status_idx" ON "bug_reports"("status");

-- CreateIndex
CREATE INDEX "ai_usage_userId_feature_createdAt_idx" ON "ai_usage"("userId", "feature", "createdAt");
