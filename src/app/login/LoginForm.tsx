"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { Recaptcha } from "@/components/Recaptcha";
import { GoogleButton } from "@/components/GoogleButton";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Autentificarea cu Google nu este încă disponibilă.",
  google_state: "Sesiunea de autentificare Google a expirat. Încearcă din nou.",
  google_failed: "Autentificarea cu Google a eșuat. Încearcă din nou.",
  google_no_email: "Contul tău Google nu are o adresă de email disponibilă.",
};

export function LoginForm({ googleError }: { googleError?: string }) {
  const [error, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="mt-8 space-y-4">
      {googleError && GOOGLE_ERROR_MESSAGES[googleError] && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {GOOGLE_ERROR_MESSAGES[googleError]}
        </p>
      )}
      <GoogleButton label="Continuă cu Google" />

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        sau
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={formAction} className="space-y-4">
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Parolă</label>
            <Link href="/uita-parola" className="text-xs font-medium text-brand hover:underline">
              Ai uitat parola?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="remember" defaultChecked className="rounded border-slate-300" />
          Ține-mă conectat
        </label>
        <Recaptcha />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Se autentifică…" : "Autentificare"}
        </button>
      </form>
    </div>
  );
}
