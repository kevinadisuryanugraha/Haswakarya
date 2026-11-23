-- Indeks pencarian jejak audit: filter aksi dan aktor selalu diurutkan createdAt DESC.
CREATE INDEX IF NOT EXISTS "AuditTrail_action_createdAt_idx" ON "AuditTrail"("action", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditTrail_userId_createdAt_idx" ON "AuditTrail"("userId", "createdAt");
