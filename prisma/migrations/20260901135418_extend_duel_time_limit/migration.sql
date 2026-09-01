ALTER TABLE "Duel"
  ALTER COLUMN "time_limit_seconds" SET DEFAULT 7200;

-- Pending rooms and currently running short duels receive the requested
-- two-hour window. Longer custom duels are preserved.
UPDATE "Duel"
SET "time_limit_seconds" = 7200
WHERE "status" IN ('PENDING', 'ACTIVE')
  AND "time_limit_seconds" < 7200;
