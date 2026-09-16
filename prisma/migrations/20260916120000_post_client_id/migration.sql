-- AlterTable
ALTER TABLE "Post" ADD COLUMN "client_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_author_id_client_id_key" ON "Post"("author_id", "client_id");
