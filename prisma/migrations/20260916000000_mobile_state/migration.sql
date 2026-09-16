-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "client_id" TEXT;

-- CreateTable
CREATE TABLE "MobileState" (
    "user_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobileState_pkey" PRIMARY KEY ("user_id","key")
);

-- CreateTable
CREATE TABLE "MobileDevice" (
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobileDevice_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE INDEX "MobileDevice_user_id_enabled_idx" ON "MobileDevice"("user_id", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "Message_sender_id_client_id_key" ON "Message"("sender_id", "client_id");

-- AddForeignKey
ALTER TABLE "MobileState" ADD CONSTRAINT "MobileState_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobileDevice" ADD CONSTRAINT "MobileDevice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- State and tokens are served only by the authenticated backend, never the Data API.
ALTER TABLE "MobileState" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MobileDevice" ENABLE ROW LEVEL SECURITY;
