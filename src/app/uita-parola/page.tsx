import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = { title: "Ai uitat parola?" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Ai uitat parola?</h1>
      <p className="mt-2 text-sm text-slate-500">
        Introdu adresa de email asociată contului tău și îți trimitem un link de resetare.
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-sm text-slate-500">
        Ți-ai amintit parola?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Autentifică-te
        </Link>
      </p>
    </div>
  );
}
