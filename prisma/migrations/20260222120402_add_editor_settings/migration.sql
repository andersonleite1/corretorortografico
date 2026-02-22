-- CreateTable
CREATE TABLE "editor_settings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "toolbarSettings" JSONB NOT NULL DEFAULT '{}',
    "activeTones" JSONB NOT NULL DEFAULT '{}',
    "customTones" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "editor_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "editor_settings_userId_key" ON "editor_settings"("userId");

-- CreateIndex
CREATE INDEX "editor_settings_userId_idx" ON "editor_settings"("userId");

-- AddForeignKey
ALTER TABLE "editor_settings" ADD CONSTRAINT "editor_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
