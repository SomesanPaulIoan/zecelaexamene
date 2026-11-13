import "server-only";
import { prisma } from "@/lib/prisma";

export async function getCourseAccess(userId: string | null, courseId: string) {
  if (!userId) return null;
  return prisma.courseAccess.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
}

export async function hasCourseAccess(userId: string | null, courseId: string): Promise<boolean> {
  const access = await getCourseAccess(userId, courseId);
  if (!access) return false;
  return !access.expiresAt || access.expiresAt > new Date();
}
