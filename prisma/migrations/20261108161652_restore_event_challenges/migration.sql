-- CreateTable
CREATE TABLE IF NOT EXISTS "EventChallenge" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "expected_answer" TEXT NOT NULL,
    "examples" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EventChallenge_event_id_position_key" ON "EventChallenge"("event_id", "position");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EventChallenge_event_id_idx" ON "EventChallenge"("event_id");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"EventChallenge"'::regclass AND conname = 'EventChallenge_event_id_fkey') THEN
    ALTER TABLE "EventChallenge" ADD CONSTRAINT "EventChallenge_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Expected answers are only available through the authorized server service.
ALTER TABLE "EventChallenge" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "EventChallenge" FROM PUBLIC, anon, authenticated;
