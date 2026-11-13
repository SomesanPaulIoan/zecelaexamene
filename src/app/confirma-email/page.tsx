import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { consumeVerificationToken } from "@/lib/verification-tokens";

export const metadata: Metadata = { title: "Confirmă adresa de email" };

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let ok = false;
  let message = "Acest link de confirmare este incomplet.";

  if (token) {
    const result = await consumeVerificationToken(token, "EMAIL_VERIFY");
    if (result.ok) {
      await prisma.user.update({ where: { id: result.user.id }, data: { emailConfirmed: true } });
      ok = true;
      message = "Adresa ta de email a fost confirmată!";
    } else if (result.reason === "used") {
      message = "Acest link a fost deja folosit.";
    } else if (result.reason === "expired") {
      message = "Acest link de confirmare a expirat.";
    } else {
      message = "Acest link de confirmare nu este valid.";
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Confirmare email</h1>
      <p
        className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
          ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
        }`}
      >
        {message}
      </p>
      <Link href="/contul-meu" className="mt-6 inline-block font-medium text-brand hover:underline">
        Mergi la contul meu
      </Link>
    </div>
  );
}
