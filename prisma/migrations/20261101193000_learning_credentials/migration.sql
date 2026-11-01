CREATE TABLE "learning_credentials" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "definitionId" TEXT NOT NULL,
  "definitionVersion" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "integrityHash" TEXT NOT NULL,
  "issuedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verifiedAt" TIMESTAMPTZ(3) NOT NULL,
  "revokedAt" TIMESTAMPTZ(3),
  "revocationReason" TEXT,
  CONSTRAINT "learning_credentials_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "learning_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "learning_credentials_version_check" CHECK ("definitionVersion" > 0),
  CONSTRAINT "learning_credentials_snapshot_check" CHECK (jsonb_typeof("snapshot") = 'object'),
  CONSTRAINT "learning_credentials_hash_check" CHECK ("integrityHash" ~ '^[a-f0-9]{64}$')
);
CREATE UNIQUE INDEX "learning_credentials_userId_definitionId_definitionVersion_key" ON "learning_credentials"("userId", "definitionId", "definitionVersion");
CREATE INDEX "learning_credentials_userId_issuedAt_idx" ON "learning_credentials"("userId", "issuedAt" DESC);

-- Issued identity and requirements are an immutable registry snapshot. Revocation
-- is a separate update and never edits the learner's completion or XP ledgers.
CREATE FUNCTION "reject_learning_credential_snapshot_change"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."id" IS DISTINCT FROM OLD."id"
    OR NEW."userId" IS DISTINCT FROM OLD."userId"
    OR NEW."definitionId" IS DISTINCT FROM OLD."definitionId"
    OR NEW."definitionVersion" IS DISTINCT FROM OLD."definitionVersion"
    OR NEW."snapshot" IS DISTINCT FROM OLD."snapshot"
    OR NEW."integrityHash" IS DISTINCT FROM OLD."integrityHash"
    OR NEW."issuedAt" IS DISTINCT FROM OLD."issuedAt"
    OR NEW."verifiedAt" IS DISTINCT FROM OLD."verifiedAt"
  THEN
    RAISE EXCEPTION 'Issued credential snapshots are immutable' USING ERRCODE = '23514';
  END IF;
  IF OLD."revokedAt" IS NOT NULL AND NEW."revokedAt" IS NULL THEN
    RAISE EXCEPTION 'A revoked credential cannot be reissued' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "learning_credentials_immutable_snapshot"
BEFORE UPDATE ON "learning_credentials"
FOR EACH ROW EXECUTE FUNCTION "reject_learning_credential_snapshot_change"();

-- Browser/Data API clients cannot enumerate private ownership or write grants.
-- All public verification uses an explicit server projection by certificate ID.
ALTER TABLE "learning_credentials" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "learning_credentials" FROM PUBLIC;
REVOKE ALL ON FUNCTION "reject_learning_credential_snapshot_change"() FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "learning_credentials" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "learning_credentials" FROM authenticated;
  END IF;
END $$;

-- Retire only the known demonstration badge definitions and their grants.
-- Real quizzes, submissions, learning progress, XP and profile titles are untouched.
DELETE FROM "UserBadge" WHERE badge_id IN (
  SELECT id FROM "Badge" WHERE slug IN (
    'hello_world', 'segfault_survivor', 'git_push_force', 'typescript_wizard',
    'rustacean_approved', 'stack_overflow_ban', 'speed_coder', 'debug_ninja',
    'coffee_overflow', 'code_streak', 'python_master', 'rust_practitioner', 'community_educator'
  )
);
DELETE FROM "Badge" WHERE slug IN (
  'hello_world', 'segfault_survivor', 'git_push_force', 'typescript_wizard',
  'rustacean_approved', 'stack_overflow_ban', 'speed_coder', 'debug_ninja',
  'coffee_overflow', 'code_streak', 'python_master', 'rust_practitioner', 'community_educator'
);
