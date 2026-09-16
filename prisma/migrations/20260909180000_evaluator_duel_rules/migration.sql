-- Evaluator governance: specialties, standing and auditable sanctions.
CREATE TYPE "EvaluatorProfileStatus" AS ENUM ('ACTIVE', 'PROBATION', 'SUSPENDED', 'REVOKED');

ALTER TABLE "User"
ADD COLUMN "consecutive_duel_abandons" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "consecutive_rejections";

ALTER TABLE "EvaluatorProfile"
ADD COLUMN "tech_stack" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "status" "EvaluatorProfileStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "sanction_reason" TEXT,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "EvaluatorProfile" profile
SET "tech_stack" = COALESCE(
  (
    SELECT candidate."tech_stack"
    FROM "EvaluatorApplication" candidate
    WHERE candidate."user_id" = profile."user_id"
      AND candidate."status" = 'APPROVED'
    ORDER BY candidate."reviewed_at" DESC NULLS LAST, candidate."created_at" DESC
    LIMIT 1
  ),
  ARRAY['TypeScript', 'JavaScript', 'Python']::TEXT[]
);

ALTER TABLE "DuelRequest"
ADD COLUMN "publish_on_expiry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "problem_id" TEXT,
ADD COLUMN "problem_title" TEXT,
ADD COLUMN "problem_body" TEXT,
ADD COLUMN "published_duel_id" TEXT;

CREATE UNIQUE INDEX "DuelRequest_published_duel_id_key" ON "DuelRequest"("published_duel_id");
CREATE INDEX "DuelRequest_status_expires_at_idx" ON "DuelRequest"("status", "expires_at");

ALTER TABLE "DuelRequest"
ADD CONSTRAINT "DuelRequest_published_duel_id_fkey"
FOREIGN KEY ("published_duel_id") REFERENCES "Duel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
