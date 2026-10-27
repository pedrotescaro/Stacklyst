CREATE TABLE "security_audit_events" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retain_until" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "security_audit_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "security_audit_minimum_retention" CHECK ("retain_until" >= "created_at" + INTERVAL '4320 hours')
);
CREATE INDEX "security_audit_events_retain_until_idx" ON "security_audit_events"("retain_until");
CREATE INDEX "security_audit_events_resource_id_created_at_idx" ON "security_audit_events"("resource_id", "created_at" DESC);
ALTER TABLE "security_audit_events" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "security_audit_events" FROM PUBLIC;
-- Supabase API roles must not be able to read or alter administrative evidence.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "security_audit_events" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "security_audit_events" FROM authenticated;
  END IF;
END $$;

CREATE FUNCTION prevent_security_audit_rewrite() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' OR OLD.retain_until > CURRENT_TIMESTAMP THEN
    RAISE EXCEPTION 'Security audit records are immutable until retention expires';
  END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER security_audit_retention_guard
  BEFORE UPDATE OR DELETE ON "security_audit_events"
  FOR EACH ROW EXECUTE FUNCTION prevent_security_audit_rewrite();

CREATE INDEX "Message_sender_id_receiver_id_created_at_id_idx" ON "Message"("sender_id", "receiver_id", "created_at" DESC, "id" DESC);
CREATE INDEX "Message_receiver_id_sender_id_created_at_id_idx" ON "Message"("receiver_id", "sender_id", "created_at" DESC, "id" DESC);
