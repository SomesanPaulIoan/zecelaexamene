import "server-only";
import { createVerificationToken } from "@/lib/verification-tokens";
import { sendMail } from "@/lib/mail";
import { renderPasswordResetEmail } from "@/lib/emails/password-reset";
import { renderEmailVerifyEmail } from "@/lib/emails/email-verify";

function siteUrl() {
  return process.env.SITE_URL ?? "http://localhost:3000";
}

type MinimalUser = { id: string; email: string; firstName: string };

export async function sendPasswordResetEmail(user: MinimalUser) {
  const token = await createVerificationToken(user.id, "PASSWORD_RESET");
  const { subject, html, text } = renderPasswordResetEmail({
    firstName: user.firstName,
    resetUrl: `${siteUrl()}/reseteaza-parola?token=${token}`,
  });
  await sendMail({ to: user.email, subject, html, text });
}

export async function sendEmailVerification(user: MinimalUser) {
  const token = await createVerificationToken(user.id, "EMAIL_VERIFY");
  const { subject, html, text } = renderEmailVerifyEmail({
    firstName: user.firstName,
    verifyUrl: `${siteUrl()}/confirma-email?token=${token}`,
  });
  await sendMail({ to: user.email, subject, html, text });
}
