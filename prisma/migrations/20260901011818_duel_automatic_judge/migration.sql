ALTER TYPE "DuelStatus" ADD VALUE IF NOT EXISTS 'REVIEW_PENDING';
ALTER TYPE "DuelStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

CREATE TYPE "DuelSubmissionStatus" AS ENUM (
  'ACCEPTED',
  'WRONG_ANSWER',
  'COMPILE_ERROR',
  'RUNTIME_ERROR',
  'TIME_LIMIT_EXCEEDED',
  'JUDGE_UNAVAILABLE'
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EvaluationType') THEN
    CREATE TYPE "EvaluationType" AS ENUM ('AUTOMATIC', 'AI_SUGGESTED', 'HUMAN_EVALUATED');
  END IF;
END $$;

ALTER TABLE "Duel"
  ADD COLUMN "problem_id" TEXT,
  ADD COLUMN "match_deadline" TIMESTAMP(3),
  ADD COLUMN "closed_reason" TEXT,
  ADD COLUMN "xp_awarded_at" TIMESTAMP(3);

UPDATE "Duel"
SET "match_deadline" = "created_at" + INTERVAL '24 hours'
WHERE "status" = 'PENDING' AND "match_deadline" IS NULL;

ALTER TABLE "DuelSolution"
  ADD COLUMN "score" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "runtime_ms" INTEGER,
  ADD COLUMN "complexity" TEXT,
  ADD COLUMN "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "DuelEvaluation" (
  "id" TEXT NOT NULL,
  "duel_id" TEXT NOT NULL,
  "evaluator_id" TEXT,
  "type" "EvaluationType" NOT NULL DEFAULT 'AUTOMATIC',
  "score_player1" INTEGER NOT NULL DEFAULT 0,
  "score_player2" INTEGER NOT NULL DEFAULT 0,
  "system_analysis" JSONB,
  "human_feedback" TEXT,
  "strengths" TEXT[] NOT NULL,
  "improvements" TEXT[] NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DuelEvaluation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DuelEvaluation_duel_id_fkey" FOREIGN KEY ("duel_id") REFERENCES "Duel"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "DuelEvaluation_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'DuelEvaluation' AND column_name = 'ai_analysis'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'DuelEvaluation' AND column_name = 'system_analysis'
  ) THEN
    ALTER TABLE "DuelEvaluation" RENAME COLUMN "ai_analysis" TO "system_analysis";
  END IF;
END $$;

CREATE TABLE "DuelSubmission" (
  "id" TEXT NOT NULL,
  "duel_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "status" "DuelSubmissionStatus" NOT NULL,
  "passed_tests" INTEGER NOT NULL DEFAULT 0,
  "total_tests" INTEGER NOT NULL DEFAULT 0,
  "runtime_ms" INTEGER,
  "complexity" TEXT,
  "complexity_score" INTEGER NOT NULL DEFAULT 0,
  "score" INTEGER NOT NULL DEFAULT 0,
  "public_result" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DuelSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Duel_status_match_deadline_idx" ON "Duel"("status", "match_deadline");
CREATE INDEX "Duel_language_status_created_at_idx" ON "Duel"("language", "status", "created_at");
CREATE INDEX "DuelSubmission_duel_id_user_id_created_at_idx" ON "DuelSubmission"("duel_id", "user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "DuelEvaluation_duel_id_idx" ON "DuelEvaluation"("duel_id");

ALTER TABLE "DuelSubmission" ADD CONSTRAINT "DuelSubmission_duel_id_fkey"
  FOREIGN KEY ("duel_id") REFERENCES "Duel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DuelSubmission" ADD CONSTRAINT "DuelSubmission_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Duel_winner_id_fkey') THEN
    ALTER TABLE "Duel" ADD CONSTRAINT "Duel_winner_id_fkey"
      FOREIGN KEY ("winner_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Submissions contain private code and judge metadata. The application accesses them
-- through the server-side Prisma connection; browser-facing Data API roles receive no access.
ALTER TABLE "DuelSubmission" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "DuelSubmission" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "DuelSubmission" FROM authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "DuelSubmission" TO service_role;
  END IF;
END $$;
