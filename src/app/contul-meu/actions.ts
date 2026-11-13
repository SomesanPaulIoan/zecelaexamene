"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { sendEmailVerification } from "@/lib/auth-flows";

export async function resendEmailVerificationAction() {
  const user = await requireUser();
  if (!user.emailConfirmed) {
    await sendEmailVerification(user);
  }
  redirect("/contul-meu?retrimis=1");
}
