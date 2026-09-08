-- CreateTable
CREATE TABLE "rate_limit_requests" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rate_limit_requests_key_createdAt_idx" ON "rate_limit_requests"("key", "createdAt");

-- CreateIndex
CREATE INDEX "rate_limit_requests_createdAt_idx" ON "rate_limit_requests"("createdAt");
