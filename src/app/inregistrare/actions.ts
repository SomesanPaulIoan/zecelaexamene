"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { sendEmailVerification } from "@/lib/auth-flows";

const RegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Parola trebuie să aibă cel puțin 8 caractere."),
});

export async function registerAction(_prevState: string | null, formData: FormData) {
  const parsed = RegisterSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Date invalide.";

  if (!(await verifyRecaptcha(formData.get("g-recaptcha-response")))) {
    return "Verificarea reCAPTCHA a eșuat. Te rugăm să reîncerci.";
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return "Există deja un cont cu acest email.";

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      passwordHash,
    },
  });

  try {
    await sendEmailVerification(user);
  } catch (err) {
    console.error(`[mail] Failed to send email verification for user ${user.id}:`, err);
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  redirect("/contul-meu");
}
