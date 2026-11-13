-- Add the same legacy-source dedup unique constraint that Course already has, so the
-- migration script's Order upserts (keyed by legacySourceTable+legacySourceId) are idempotent.
CREATE UNIQUE INDEX "Order_legacySourceTable_legacySourceId_key" ON "Order"("legacySourceTable", "legacySourceId");
