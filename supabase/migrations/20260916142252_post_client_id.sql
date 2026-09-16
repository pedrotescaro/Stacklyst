ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "client_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Post_author_id_client_id_key" ON "Post"("author_id", "client_id");
