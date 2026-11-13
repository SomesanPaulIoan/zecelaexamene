"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUSES = ["NEW", "IN_PROGRESS", "DONE"] as const;

export async function updateContactStatusAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) throw new Error("Status invalid.");

  await prisma.contactMessage.update({ where: { id }, data: { status: status as (typeof STATUSES)[number] } });
  revalidatePath("/admin/mesaje");
}

export async function updateReturnStatusAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) throw new Error("Status invalid.");

  await prisma.returnRequest.update({ where: { id }, data: { status: status as (typeof STATUSES)[number] } });
  revalidatePath("/admin/mesaje");
}
