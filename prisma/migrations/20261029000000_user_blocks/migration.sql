CREATE TABLE "user_blocks" (
  "blockerId" TEXT NOT NULL,
  "blockedId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_blocks_pkey" PRIMARY KEY ("blockerId", "blockedId"),
  CONSTRAINT "user_blocks_no_self_block" CHECK ("blockerId" <> "blockedId"),
  CONSTRAINT "user_blocks_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "user_blocks_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "user_blocks_blockedId_idx" ON "user_blocks"("blockedId");

-- Block relationships are private. Authenticated application routes use the
-- server database connection; browser clients have no direct table access.
ALTER TABLE "user_blocks" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "user_blocks" FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "user_blocks" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "user_blocks" FROM authenticated;
  END IF;
END $$;
