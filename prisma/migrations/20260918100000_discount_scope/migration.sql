-- CreateEnum
CREATE TYPE "DiscountScope" AS ENUM ('BOOK', 'COURSE', 'ALL');

-- AlterTable
ALTER TABLE "DiscountCode" ADD COLUMN     "scope" "DiscountScope" NOT NULL DEFAULT 'ALL';
