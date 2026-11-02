ALTER TABLE "rpg_battles" ADD COLUMN "enemyLevel" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "enemyMaxHp" INTEGER NOT NULL DEFAULT 100;
UPDATE "rpg_battles" SET "enemyLevel" = CASE
  WHEN "creature" IN ('blue-slime', 'byte-bug') THEN 2
  WHEN "creature" IN ('ember', 'null-ghost') THEN 3 ELSE 1 END;

CREATE TABLE "rpg_arena_rooms" (
  "id" TEXT NOT NULL,
  "hostId" TEXT NOT NULL,
  "guestId" TEXT,
  "inviteeId" TEXT,
  "inviteExpiresAt" TIMESTAMP(3),
  "hostLanguage" TEXT NOT NULL,
  "guestLanguage" TEXT,
  "hostPosition" JSONB NOT NULL DEFAULT '{"x":320,"y":340,"direction":"down","walking":false}',
  "guestPosition" JSONB NOT NULL DEFAULT '{"x":448,"y":340,"direction":"down","walking":false}',
  "hostSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "guestSeenAt" TIMESTAMP(3),
  "match" JSONB,
  "version" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rpg_arena_rooms_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "rpg_arena_rooms_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "rpg_arena_rooms_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "rpg_arena_rooms_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "rpg_arena_distinct_players" CHECK ("hostId" IS DISTINCT FROM "guestId" AND "hostId" IS DISTINCT FROM "inviteeId"),
  CONSTRAINT "rpg_arena_host_language" CHECK ("hostLanguage" IN ('JS','TS','PYTHON','RUST','GO','JAVA','HTML','CSS')),
  CONSTRAINT "rpg_arena_guest_language" CHECK ("guestLanguage" IS NULL OR "guestLanguage" IN ('JS','TS','PYTHON','RUST','GO','JAVA','HTML','CSS'))
);
CREATE UNIQUE INDEX "rpg_arena_rooms_hostId_key" ON "rpg_arena_rooms"("hostId");
CREATE UNIQUE INDEX "rpg_arena_rooms_guestId_key" ON "rpg_arena_rooms"("guestId");
CREATE INDEX "rpg_arena_rooms_inviteeId_inviteExpiresAt_idx" ON "rpg_arena_rooms"("inviteeId", "inviteExpiresAt");

-- Room identity, outfits and combat state are served only through the authenticated
-- application API, which checks membership and mutual follows on the server.
ALTER TABLE "rpg_arena_rooms" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "rpg_arena_rooms" FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "rpg_arena_rooms" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "rpg_arena_rooms" FROM authenticated;
  END IF;
END $$;
