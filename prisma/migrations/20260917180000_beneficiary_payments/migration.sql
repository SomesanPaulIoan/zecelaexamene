-- CreateTable
CREATE TABLE "BeneficiaryPayment" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeneficiaryPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BeneficiaryPayment_beneficiaryId_idx" ON "BeneficiaryPayment"("beneficiaryId");

-- AddForeignKey
ALTER TABLE "BeneficiaryPayment" ADD CONSTRAINT "BeneficiaryPayment_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

