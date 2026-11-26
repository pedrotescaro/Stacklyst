-- Replies get their own saved state; saving one reply no longer saves the whole thread.
CREATE TABLE "AnswerBookmark" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "answer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerBookmark_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnswerBookmark_user_id_answer_id_key" ON "AnswerBookmark"("user_id", "answer_id");
CREATE INDEX "AnswerBookmark_created_at_idx" ON "AnswerBookmark"("created_at");

ALTER TABLE "AnswerBookmark" ADD CONSTRAINT "AnswerBookmark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnswerBookmark" ADD CONSTRAINT "AnswerBookmark_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
