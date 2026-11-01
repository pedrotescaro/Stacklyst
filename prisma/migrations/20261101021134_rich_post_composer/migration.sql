-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "audience" TEXT NOT NULL DEFAULT 'everyone',
ADD COLUMN     "music" JSONB;

-- CreateTable
CREATE TABLE "PostMedia" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "post_id" TEXT,
    "storage_path" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostPoll" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostPoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostPollOption" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "PostPollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostPollVote" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "PostPollVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostMedia_storage_path_key" ON "PostMedia"("storage_path");

-- CreateIndex
CREATE INDEX "PostMedia_owner_id_created_at_idx" ON "PostMedia"("owner_id", "created_at");

-- CreateIndex
CREATE INDEX "PostMedia_post_id_idx" ON "PostMedia"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "PostPoll_post_id_key" ON "PostPoll"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "PostPollOption_poll_id_position_key" ON "PostPollOption"("poll_id", "position");

-- CreateIndex
CREATE INDEX "PostPollVote_option_id_idx" ON "PostPollVote"("option_id");

-- CreateIndex
CREATE INDEX "PostPollVote_user_id_idx" ON "PostPollVote"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "PostPollVote_poll_id_user_id_key" ON "PostPollVote"("poll_id", "user_id");

-- AddForeignKey
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostPoll" ADD CONSTRAINT "PostPoll_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostPollOption" ADD CONSTRAINT "PostPollOption_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "PostPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostPollVote" ADD CONSTRAINT "PostPollVote_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "PostPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostPollVote" ADD CONSTRAINT "PostPollVote_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "PostPollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostPollVote" ADD CONSTRAINT "PostPollVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Only application routes access posts and attachments. Browser roles cannot
-- bypass the audience checks implemented by the server database connection.
ALTER TABLE "Post" ADD CONSTRAINT "Post_audience_check" CHECK ("audience" IN ('everyone', 'followers'));
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PostMedia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PostPoll" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PostPollOption" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PostPollVote" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "Post", "PostMedia", "PostPoll", "PostPollOption", "PostPollVote" FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "Post", "PostMedia", "PostPoll", "PostPollOption", "PostPollVote" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "Post", "PostMedia", "PostPoll", "PostPollOption", "PostPollVote" FROM authenticated;
  END IF;
END $$;
