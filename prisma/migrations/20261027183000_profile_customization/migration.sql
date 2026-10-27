-- CreateTable
CREATE TABLE "profile_customizations" (
    "userId" TEXT NOT NULL,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "chat" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "profile_customizations_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "profile_achievement_catalogs" (
    "id" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "profile_achievement_catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile_achievements" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "unlockedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "announcedAt" TIMESTAMPTZ(3),

    CONSTRAINT "user_profile_achievements_pkey" PRIMARY KEY ("userId","achievementId")
);

-- CreateIndex
CREATE INDEX "user_profile_achievements_userId_unlockedAt_idx" ON "user_profile_achievements"("userId", "unlockedAt" DESC);

-- AddForeignKey
ALTER TABLE "profile_customizations" ADD CONSTRAINT "profile_customizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile_achievements" ADD CONSTRAINT "user_profile_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Only application server routes may write preferences or award achievements.
ALTER TABLE "profile_customizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profile_achievement_catalogs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_profile_achievements" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "profile_customizations", "profile_achievement_catalogs", "user_profile_achievements" FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
    REVOKE ALL ON TABLE "profile_customizations", "profile_achievement_catalogs", "user_profile_achievements" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
    REVOKE ALL ON TABLE "profile_customizations", "profile_achievement_catalogs", "user_profile_achievements" FROM authenticated;
  END IF;
END $$;
