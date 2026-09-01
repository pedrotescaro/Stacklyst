-- Legacy active duels predate the explicit start timestamp. Use their creation
-- time so the maintenance worker can enforce the configured duel deadline.
UPDATE "Duel"
SET "started_at" = "created_at"
WHERE "status" = 'ACTIVE'
  AND "started_at" IS NULL;
