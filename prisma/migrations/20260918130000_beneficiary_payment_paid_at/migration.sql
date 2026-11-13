-- AlterTable
ALTER TABLE "BeneficiaryPayment" ADD COLUMN     "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill: existing rows had no explicit payment date, so use their record-creation
-- timestamp rather than leaving every historical payment dated "today".
UPDATE "BeneficiaryPayment" SET "paidAt" = "createdAt";
