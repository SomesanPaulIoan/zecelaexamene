"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { consumeVerificationToken } from "@/lib/verification-tokens";

export type ResetPasswordState = { message: string } | null;

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) return { message: "Parola trebuie să aibă cel puțin 8 caractere." };
  if (password !== confirmPassword) return { message: "Parolele nu coincid." };

  const result = await consumeVerificationToken(token, "PASSWORD_RESET");
  if (!result.ok) {
    return { message: "Linkul de resetare este invalid sau a expirat. Solicită unul nou." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.update({ where: { id: result.user.id }, data: { passwordHash } });

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  redirect(user.role === "CUSTOMER" ? "/contul-meu" : "/admin");
}
