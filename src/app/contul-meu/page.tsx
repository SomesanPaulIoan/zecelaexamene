import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUBJECT_LABELS, formatRON } from "@/lib/subjects";
import { resendEmailVerificationAction } from "./actions";

export const metadata: Metadata = { title: "Contul meu" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ retrimis?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { retrimis } = await searchParams;

  const access = await prisma.courseAccess.findMany({
    where: { userId: user.id },
    include: { course: true },
    orderBy: { expiresAt: "desc" },
  });

  const orders = await prisma.order.findMany({
    where: { userId: user.id, status: "PAID" },
    include: { invoice: true, items: true },
    orderBy: { paidAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900">
        Salut, {user.firstName}
      </h1>
      <p className="mt-1 text-slate-500">{user.email}</p>

      {!user.emailConfirmed && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            {retrimis
              ? "Ți-am retrimis emailul de confirmare — verifică-ți inboxul."
              : "Adresa ta de email nu este confirmată încă."}
          </span>
          {!retrimis && (
            <form action={resendEmailVerificationAction}>
              <button type="submit" className="font-semibold text-amber-900 hover:underline">
                Retrimite emailul
              </button>
            </form>
          )}
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Cursurile mele</h2>
      {access.length === 0 ? (
        <p className="mt-3 text-slate-500">Nu ai încă acces la niciun curs.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
          {access.map((a) => {
            const active = !a.expiresAt || a.expiresAt > new Date();
            const daysLeft = a.expiresAt
              ? Math.ceil((a.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;
            return (
              <li key={a.id}>
                <Link
                  href={`/cursuri/${a.course.slug}`}
                  className="flex items-center justify-between px-4 py-3 transition hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{a.course.title}</p>
                    <p className="text-sm text-slate-500">{SUBJECT_LABELS[a.course.subject]}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className={active ? "text-emerald-600" : "text-rose-600"}>
                      {active ? "Acces activ" : "Acces expirat"}
                    </p>
                    {a.expiresAt && (
                      <p className="text-slate-400">
                        {active && daysLeft !== null
                          ? `mai ai ${daysLeft} ${daysLeft === 1 ? "zi" : "zile"} · `
                          : ""}
                        până la {a.expiresAt.toLocaleDateString("ro-RO")}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Facturile mele</h2>
      {orders.length === 0 ? (
        <p className="mt-3 text-slate-500">Nu ai încă nicio comandă plătită.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">
                  {o.items.map((i) => i.title || "Produs").join(", ") || (o.type === "COURSE" ? "Curs" : "Carte")}
                </p>
                <p className="text-sm text-slate-500">
                  {(o.paidAt ?? o.createdAt).toLocaleDateString("ro-RO")} · {formatRON(o.total)}
                </p>
              </div>
              {o.invoice?.pdfData ? (
                <a
                  href={`/api/facturi/${o.invoice.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-none rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-brand hover:text-brand"
                >
                  Vezi factura
                </a>
              ) : o.invoice ? (
                <span className="flex-none text-sm text-slate-400">
                  {o.invoice.series}-{o.invoice.number}
                </span>
              ) : (
                <span className="flex-none text-sm text-slate-400">Factură în curs</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
