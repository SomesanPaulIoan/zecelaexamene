"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { verifyRecaptcha } from "@/lib/recaptcha";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(_prevState: string | null, formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return "Completează un email și o parolă valide.";

  if (!(await verifyRecaptcha(formData.get("g-recaptcha-response")))) {
    return "Verificarea reCAPTCHA a eșuat. Te rugăm să reîncerci.";
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return "Email sau parolă incorectă.";

  if (!user.passwordHash) {
    return "Acest cont este conectat prin Google. Autentifică-te cu butonul „Continuă cu Google”.";
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return "Email sau parolă incorectă.";

  const remember = formData.get("remember") === "on";
  const session = await getSession({ remember });
  session.userId = user.id;
  await session.save();

  redirect(user.role === "CUSTOMER" ? "/contul-meu" : "/admin");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}
