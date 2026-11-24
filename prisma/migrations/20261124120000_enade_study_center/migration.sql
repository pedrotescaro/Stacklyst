-- Central ENADE: private learning history for each user.
-- The study library and the official question bank are versioned content in the
-- repository and are shared read-only; nothing here stores editable material.

CREATE TYPE "EnadeAttemptKind" AS ENUM ('STANDARD', 'CUSTOM', 'WRONG_ONLY', 'REVIEW', 'TOPIC', 'PRACTICE');
CREATE TYPE "EnadeAttemptStatus" AS ENUM ('IN_PROGRESS', 'FINISHED', 'ABANDONED');
CREATE TYPE "EnadeReviewStatus" AS ENUM ('OPEN', 'RECOVERED');
CREATE TYPE "EnadeFavoriteKind" AS ENUM ('ARTICLE', 'QUESTION');

CREATE TABLE "enade_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" "EnadeAttemptKind" NOT NULL,
    "mode" TEXT NOT NULL,
    "status" "EnadeAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "title" TEXT NOT NULL,
    "source_year" INTEGER,
    "topic" TEXT,
    "parent_id" TEXT,
    "client_ref" TEXT,
    "state" JSONB NOT NULL,
    "question_count" INTEGER NOT NULL,
    "answered_count" INTEGER NOT NULL DEFAULT 0,
    "scored_count" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "wrong_count" INTEGER NOT NULL DEFAULT 0,
    "blank_count" INTEGER NOT NULL DEFAULT 0,
    "elapsed_ms" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "enade_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "enade_attempts_mode_check" CHECK ("mode" IN ('exam', 'training')),
    CONSTRAINT "enade_attempts_counts_check" CHECK (
      "question_count" > 0 AND "answered_count" >= 0 AND "correct_count" >= 0
      AND "wrong_count" >= 0 AND "blank_count" >= 0 AND "elapsed_ms" >= 0
      AND "correct_count" + "wrong_count" <= "scored_count"
    ),
    CONSTRAINT "enade_attempts_state_check" CHECK (jsonb_typeof("state") = 'object'),
    CONSTRAINT "enade_attempts_finished_check" CHECK (("status" = 'FINISHED') = ("finished_at" IS NOT NULL))
);

CREATE TABLE "enade_answers" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "topic" TEXT,
    "selected" TEXT,
    "correct" BOOLEAN,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enade_answers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "enade_answers_section_check" CHECK ("section" IN ('general', 'specific'))
);

CREATE TABLE "enade_review_items" (
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "topic" TEXT,
    "status" "EnadeReviewStatus" NOT NULL DEFAULT 'OPEN',
    "wrong_count" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "ease" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval_days" INTEGER NOT NULL DEFAULT 0,
    "last_selected" TEXT,
    "last_attempt_id" TEXT,
    "first_wrong_at" TIMESTAMP(3) NOT NULL,
    "last_wrong_at" TIMESTAMP(3) NOT NULL,
    "last_reviewed_at" TIMESTAMP(3),
    "recovered_at" TIMESTAMP(3),
    "due_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "enade_review_items_pkey" PRIMARY KEY ("user_id", "question_id"),
    CONSTRAINT "enade_review_items_schedule_check" CHECK ("ease" >= 1.3 AND "interval_days" >= 0)
);

CREATE TABLE "enade_study_progress" (
    "user_id" TEXT NOT NULL,
    "article_slug" TEXT NOT NULL,
    "studied" BOOLEAN NOT NULL DEFAULT false,
    "studied_at" TIMESTAMP(3),
    "read_ms" INTEGER NOT NULL DEFAULT 0,
    "quiz_best" INTEGER,
    "quiz_total" INTEGER,
    "first_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enade_study_progress_pkey" PRIMARY KEY ("user_id", "article_slug"),
    CONSTRAINT "enade_study_progress_quiz_check" CHECK ("quiz_best" IS NULL OR ("quiz_best" >= 0 AND "quiz_best" <= "quiz_total"))
);

CREATE TABLE "enade_favorites" (
    "user_id" TEXT NOT NULL,
    "kind" "EnadeFavoriteKind" NOT NULL,
    "ref" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enade_favorites_pkey" PRIMARY KEY ("user_id", "kind", "ref")
);

CREATE TABLE "enade_daily_activity" (
    "user_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "reading_ms" INTEGER NOT NULL DEFAULT 0,
    "practice_ms" INTEGER NOT NULL DEFAULT 0,
    "questions_answered" INTEGER NOT NULL DEFAULT 0,
    "questions_correct" INTEGER NOT NULL DEFAULT 0,
    "articles_studied" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "enade_daily_activity_pkey" PRIMARY KEY ("user_id", "day")
);

CREATE UNIQUE INDEX "enade_attempts_user_id_client_ref_key" ON "enade_attempts"("user_id", "client_ref");
CREATE INDEX "enade_attempts_user_id_status_updated_at_idx" ON "enade_attempts"("user_id", "status", "updated_at" DESC);
CREATE INDEX "enade_attempts_user_id_finished_at_idx" ON "enade_attempts"("user_id", "finished_at" DESC);
CREATE UNIQUE INDEX "enade_answers_attempt_id_question_id_key" ON "enade_answers"("attempt_id", "question_id");
CREATE INDEX "enade_answers_user_id_question_id_idx" ON "enade_answers"("user_id", "question_id");
CREATE INDEX "enade_answers_user_id_answered_at_idx" ON "enade_answers"("user_id", "answered_at" DESC);
CREATE INDEX "enade_answers_user_id_topic_idx" ON "enade_answers"("user_id", "topic");
CREATE INDEX "enade_review_items_user_id_status_due_at_idx" ON "enade_review_items"("user_id", "status", "due_at");
CREATE INDEX "enade_study_progress_user_id_last_read_at_idx" ON "enade_study_progress"("user_id", "last_read_at" DESC);
CREATE INDEX "enade_favorites_user_id_created_at_idx" ON "enade_favorites"("user_id", "created_at" DESC);

ALTER TABLE "enade_attempts" ADD CONSTRAINT "enade_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enade_attempts" ADD CONSTRAINT "enade_attempts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "enade_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enade_answers" ADD CONSTRAINT "enade_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "enade_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enade_answers" ADD CONSTRAINT "enade_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enade_review_items" ADD CONSTRAINT "enade_review_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enade_study_progress" ADD CONSTRAINT "enade_study_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enade_favorites" ADD CONSTRAINT "enade_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enade_daily_activity" ADD CONSTRAINT "enade_daily_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- An answer always belongs to the same learner as its attempt.
CREATE FUNCTION "enade_answer_owner_matches"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "enade_attempts" a WHERE a."id" = NEW."attempt_id" AND a."user_id" = NEW."user_id"
  ) THEN
    RAISE EXCEPTION 'ENADE answer owner differs from its attempt' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "enade_answers_owner_check"
BEFORE INSERT OR UPDATE ON "enade_answers"
FOR EACH ROW EXECUTE FUNCTION "enade_answer_owner_matches"();

-- Private history is served only by the authenticated backend, which scopes every
-- query to the session user. The Data API roles get no access at all, and RLS
-- with no permissive policy denies any client that reaches these tables directly.
ALTER TABLE "enade_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "enade_answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "enade_review_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "enade_study_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "enade_favorites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "enade_daily_activity" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "enade_attempts", "enade_answers", "enade_review_items",
  "enade_study_progress", "enade_favorites", "enade_daily_activity" FROM PUBLIC;
REVOKE ALL ON FUNCTION "enade_answer_owner_matches"() FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "enade_attempts", "enade_answers", "enade_review_items",
      "enade_study_progress", "enade_favorites", "enade_daily_activity" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "enade_attempts", "enade_answers", "enade_review_items",
      "enade_study_progress", "enade_favorites", "enade_daily_activity" FROM authenticated;
  END IF;
END $$;
