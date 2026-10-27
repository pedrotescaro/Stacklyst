import { prisma } from '@/lib/prisma';

export const PRESENCE_WINDOW_SECONDS = 60;
const PRESENCE_KEY = 'platform:presence';

export interface PlatformPresenceSummary {
  activeCount: number;
  avatars: { id: string; username: string; avatarUrl: string }[];
  observedAt: string;
  activeWindowSeconds: number;
}

/** One row per verified account, shared by devices/tabs. Never touches learning activity. */
export async function recordPlatformPresence(userId: string) {
  return prisma.$executeRaw`
    INSERT INTO "MobileState" ("user_id", "key", "value", "version", "updated_at")
    SELECT "id", ${PRESENCE_KEY}, '{}'::jsonb, 1, date_trunc('milliseconds', CURRENT_TIMESTAMP) FROM "User" WHERE "id" = ${userId}
    ON CONFLICT ("user_id", "key") DO UPDATE
      SET "updated_at" = date_trunc('milliseconds', CURRENT_TIMESTAMP)
      WHERE "MobileState"."updated_at" < CURRENT_TIMESTAMP - INTERVAL '10 seconds'
  `;
}

/** A single database snapshot; samples are public community photos, not invented online members. */
export async function getPlatformPresence(): Promise<PlatformPresenceSummary> {
  const [summary] = await prisma.$queryRaw<PlatformPresenceSummary[]>`
    WITH active AS (
      SELECT s."user_id" FROM "MobileState" s
      JOIN "User" u ON u."id" = s."user_id"
      WHERE s."key" = ${PRESENCE_KEY}
        AND s."updated_at" >= CURRENT_TIMESTAMP - INTERVAL '60 seconds'
        AND s."updated_at" <= CURRENT_TIMESTAMP
    ), photos AS (
      SELECT u."id", u."username", u."avatar_url" AS "avatarUrl"
      FROM "User" u
      WHERE u."avatar_url" ~ '^https?://'
        OR u."avatar_url" ~ '^/[^/]'
      ORDER BY u."created_at" DESC, u."id" ASC LIMIT 5
    )
    SELECT (SELECT COUNT(*)::int FROM active) AS "activeCount",
      COALESCE((SELECT json_agg(photos) FROM photos), '[]'::json) AS "avatars",
      to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "observedAt",
      ${PRESENCE_WINDOW_SECONDS}::int AS "activeWindowSeconds"
  `;
  return summary;
}
