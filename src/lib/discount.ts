import "server-only";
import { prisma } from "@/lib/prisma";

export async function resolveDiscountCode(code: string | undefined | null, scope: "BOOK" | "COURSE") {
  if (!code) return null;
  const discount = await prisma.discountCode.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!discount || !discount.active) return null;
  if (discount.scope !== "ALL" && discount.scope !== scope) return null;
  if (discount.expiresAt && discount.expiresAt < new Date()) return null;
  if (discount.maxRedemptions && discount.timesRedeemed >= discount.maxRedemptions) return null;
  return discount;
}

export function applyDiscount(subtotal: number, percent: number | null) {
  if (!percent) return { discountValue: 0, total: subtotal };
  const discountValue = Math.round(subtotal * (percent / 100) * 100) / 100;
  return { discountValue, total: Math.max(0, subtotal - discountValue) };
}
