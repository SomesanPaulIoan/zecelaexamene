-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billingRegCom" TEXT,
ADD COLUMN     "billingType" TEXT NOT NULL DEFAULT 'pf',
ADD COLUMN     "codFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "lockerAddress" TEXT,
ADD COLUMN     "lockerCity" TEXT,
ADD COLUMN     "lockerCounty" TEXT,
ADD COLUMN     "lockerLat" DECIMAL(10,7),
ADD COLUMN     "lockerLng" DECIMAL(10,7),
ADD COLUMN     "lockerOohType" TEXT,
ADD COLUMN     "lockerPostal" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'card',
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "shippingNotes" TEXT;

