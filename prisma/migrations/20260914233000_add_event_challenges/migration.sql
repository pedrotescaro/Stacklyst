-- CreateTable
CREATE TABLE "EventChallenge" (
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
CREATE UNIQUE INDEX "EventChallenge_event_id_position_key" ON "EventChallenge"("event_id", "position");

-- CreateIndex
CREATE INDEX "EventChallenge_event_id_idx" ON "EventChallenge"("event_id");

-- AddForeignKey
ALTER TABLE "EventChallenge" ADD CONSTRAINT "EventChallenge_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
