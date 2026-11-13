import "server-only";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { VerificationTokenType } from "@/generated/prisma/enums";

const EXPIRY_HOURS: Record<VerificationTokenType, number> = {
  EMAIL_VERIFY: 48,
  PASSWORD_RESET: 1,
};

export async function createVerificationToken(userId: string, type: VerificationTokenType) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRY_HOURS[type] * 60 * 60 * 1000);
  await prisma.verificationToken.create({ data: { userId, type, token, expiresAt } });
  return token;
}

export async function consumeVerificationToken(token: string, type: VerificationTokenType) {
  const record = await prisma.verificationToken.findUnique({ where: { token }, include: { user: true } });
  if (!record || record.type !== type) return { ok: false as const, reason: "invalid" as const };
  if (record.usedAt) return { ok: false as const, reason: "used" as const };
  if (record.expiresAt < new Date()) return { ok: false as const, reason: "expired" as const };

  await prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return { ok: true as const, user: record.user };
}
