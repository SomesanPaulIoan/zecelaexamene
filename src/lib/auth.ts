import "server-only";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { Role } from "@/generated/prisma/enums";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { beneficiary: true },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Trebuie să fii autentificat.");
  return user;
}

export async function requireRole(roles: Array<Extract<Role, "SUPERADMIN" | "TEACHER_ADMIN">>) {
  const user = await requireUser();
  if (!roles.includes(user.role as (typeof roles)[number])) {
    throw new AuthError("Nu ai acces la această pagină.");
  }
  return user;
}

export class AuthError extends Error {}
