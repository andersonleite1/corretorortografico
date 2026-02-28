-- AlterTable
ALTER TABLE "ai_usage" ADD COLUMN     "processingTimeMs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "toneUsed" TEXT,
ADD COLUMN     "wordCount" INTEGER NOT NULL DEFAULT 0;
