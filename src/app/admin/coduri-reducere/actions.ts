"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createDiscountCodeAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const percent = Number(formData.get("percent"));
  const scope = String(formData.get("scope") ?? "ALL");
  const expiresAtRaw = String(formData.get("expiresAt") ?? "");
  const maxRedemptionsRaw = String(formData.get("maxRedemptions") ?? "");

  if (!code || !Number.isFinite(percent) || percent <= 0 || percent > 100) {
    throw new Error("Introdu un cod valid și un procent între 1 și 100.");
  }
  if (!["BOOK", "COURSE", "ALL"].includes(scope)) {
    throw new Error("Domeniu invalid.");
  }

  await prisma.discountCode.create({
    data: {
      code,
      percent,
      scope: scope as "BOOK" | "COURSE" | "ALL",
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
      maxRedemptions: maxRedemptionsRaw ? Number(maxRedemptionsRaw) : null,
    },
  });

  revalidatePath("/admin/coduri-reducere");
}

export async function toggleDiscountCodeAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const id = String(formData.get("id") ?? "");
  const code = await prisma.discountCode.findUniqueOrThrow({ where: { id } });
  await prisma.discountCode.update({ where: { id }, data: { active: !code.active } });

  revalidatePath("/admin/coduri-reducere");
}

export async function deleteDiscountCodeAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const id = String(formData.get("id") ?? "");
  await prisma.discountCode.delete({ where: { id } });

  revalidatePath("/admin/coduri-reducere");
}
