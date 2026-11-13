"use server";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/auth-flows";

export type ForgotPasswordState = { status: "success" | "error"; message: string } | null;

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { status: "error", message: "Introdu o adresă de email." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await sendPasswordResetEmail(user);
  }

  // Same message regardless of whether the email exists — don't leak account existence.
  return {
    status: "success",
    message: "Dacă adresa există în baza noastră de date, vei primi un email cu instrucțiuni de resetare.",
  };
}
