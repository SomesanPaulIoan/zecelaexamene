"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function grantCourseAccessAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const userId = String(formData.get("userId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const startAtRaw = String(formData.get("startAt") ?? "");
  const expiresAtRaw = String(formData.get("expiresAt") ?? "");

  if (!userId || !courseId || !startAtRaw) {
    throw new Error("Selectează un curs și o dată de început.");
  }

  const startAt = new Date(startAtRaw);
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  await prisma.courseAccess.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { startAt, expiresAt, source: "MANUAL", orderId: null },
    create: { userId, courseId, startAt, expiresAt, source: "MANUAL" },
  });

  revalidatePath(`/admin/utilizatori/${userId}`);
}

export async function revokeCourseAccessAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const accessId = String(formData.get("accessId") ?? "");
  const userId = String(formData.get("userId") ?? "");

  await prisma.courseAccess.delete({ where: { id: accessId } });

  revalidatePath(`/admin/utilizatori/${userId}`);
}
