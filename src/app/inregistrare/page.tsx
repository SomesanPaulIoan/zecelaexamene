import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Creează cont" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Creează cont</h1>
      <RegisterForm />
      <p className="mt-6 text-sm text-slate-500">
        Ai deja cont?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Autentifică-te
        </Link>
      </p>
    </div>
  );
}
