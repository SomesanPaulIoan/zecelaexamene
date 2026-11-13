import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Autentificare" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Autentificare</h1>
      <LoginForm googleError={error} />
      <p className="mt-6 text-sm text-slate-500">
        Nu ai cont?{" "}
        <Link href="/inregistrare" className="font-medium text-brand hover:underline">
          Creează unul
        </Link>
      </p>
    </div>
  );
}
