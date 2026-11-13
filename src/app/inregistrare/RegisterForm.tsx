"use client";

import { useActionState } from "react";
import { registerAction } from "./actions";
import { Recaptcha } from "@/components/Recaptcha";
import { GoogleButton } from "@/components/GoogleButton";

export function RegisterForm() {
  const [error, formAction, pending] = useActionState(registerAction, null);

  return (
    <div className="mt-8 space-y-4">
      <GoogleButton label="Continuă cu Google" />

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        sau
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={formAction} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Prenume</label>
          <input
            name="firstName"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Nume</label>
          <input
            name="lastName"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </div>
      </div>
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
        <label className="block text-sm font-medium text-slate-700">Parolă</label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none"
        />
      </div>
      <Recaptcha />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Se creează contul…" : "Creează cont"}
      </button>
      </form>
    </div>
  );
}
