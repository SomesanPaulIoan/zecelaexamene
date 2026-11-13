-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "audience" TEXT,
ADD COLUMN     "bonuses" TEXT,
ADD COLUMN     "courseContent" TEXT,
ADD COLUMN     "nivel" TEXT,
ADD COLUMN     "outcomes" TEXT,
ADD COLUMN     "requirements" TEXT;

-- AlterTable
ALTER TABLE "CoursePart" ADD COLUMN     "hours" INTEGER,
ADD COLUMN     "isExtension" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "salePrice" DECIMAL(10,2),
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "summary" TEXT;

-- CreateTable
CREATE TABLE "CourseVideo" (
    "id" TEXT NOT NULL,
    "coursePartId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vimeoId" TEXT NOT NULL,
    "durationSec" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFreePreview" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "legacyId" INTEGER,

    CONSTRAINT "CourseVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "legacyId" INTEGER,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseVideo_legacyId_key" ON "CourseVideo"("legacyId");

-- CreateIndex
CREATE INDEX "CourseVideo_coursePartId_idx" ON "CourseVideo"("coursePartId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_legacyId_key" ON "Review"("legacyId");

-- CreateIndex
CREATE INDEX "Review_courseId_idx" ON "Review"("courseId");

-- AddForeignKey
ALTER TABLE "CourseVideo" ADD CONSTRAINT "CourseVideo_coursePartId_fkey" FOREIGN KEY ("coursePartId") REFERENCES "CoursePart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

