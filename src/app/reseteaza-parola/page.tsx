import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = { title: "Resetează parola" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Link invalid</h1>
        <p className="mt-2 text-sm text-slate-500">
          Acest link de resetare este incomplet.{" "}
          <Link href="/uita-parola" className="font-medium text-brand hover:underline">
            Solicită unul nou
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Setează o parolă nouă</h1>
      <ResetPasswordForm token={token} />
    </div>
  );
}
