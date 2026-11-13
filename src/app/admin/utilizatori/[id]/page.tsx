import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRON } from "@/lib/subjects";
import { grantCourseAccessAction, revokeCourseAccessAction } from "../actions";

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Superadmin",
  TEACHER_ADMIN: "Admin profesor",
  CUSTOMER: "Client",
};

const SOURCE_LABELS: Record<string, string> = {
  PURCHASE: "Cumpărat",
  MIGRATION: "Migrat",
  MANUAL: "Acordat manual",
};

function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.role !== "SUPERADMIN") redirect("/admin");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      courseAccess: { include: { course: true }, orderBy: { createdAt: "desc" } },
      orders: {
        where: { status: "PAID" },
        include: { invoice: true, items: true },
        orderBy: { paidAt: "desc" },
      },
    },
  });
  if (!user) notFound();

  const courses = await prisma.course.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } });

  const today = new Date();
  const inOneYear = new Date(today);
  inOneYear.setFullYear(inOneYear.getFullYear() + 1);

  return (
    <div>
      <Link href="/admin/utilizatori" className="text-sm text-slate-500 hover:text-brand">
        ← Toți utilizatorii
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>{ROLE_LABELS[user.role] ?? user.role}</p>
          <p>
            {user.emailConfirmed ? "Email confirmat" : "Email neconfirmat"} · Înregistrat{" "}
            {user.createdAt.toLocaleDateString("ro-RO")}
          </p>
        </div>
      </div>

      {/* ---------- Course access ---------- */}
      <h3 className="mt-10 text-lg font-semibold text-slate-900">Acces cursuri</h3>

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Curs</th>
              <th className="px-4 py-3 font-medium">Început</th>
              <th className="px-4 py-3 font-medium">Expiră</th>
              <th className="px-4 py-3 font-medium">Sursă</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {user.courseAccess.map((a) => {
              const active = !a.expiresAt || a.expiresAt > new Date();
              return (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-slate-900">{a.course.title}</td>
                  <td className="px-4 py-3 text-slate-600">{a.startAt.toLocaleDateString("ro-RO")}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {a.expiresAt ? a.expiresAt.toLocaleDateString("ro-RO") : "Nelimitat"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{SOURCE_LABELS[a.source] ?? a.source}</td>
                  <td className="px-4 py-3">
                    <span className={active ? "text-emerald-600" : "text-rose-600"}>
                      {active ? "Activ" : "Expirat"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={revokeCourseAccessAction}>
                      <input type="hidden" name="accessId" value={a.id} />
                      <input type="hidden" name="userId" value={user.id} />
                      <button className="text-rose-600 hover:underline">Revocă</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {user.courseAccess.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Niciun acces la curs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form
        action={grantCourseAccessAction}
        className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <input type="hidden" name="userId" value={user.id} />
        <div>
          <label className="block text-xs font-medium text-slate-500">Curs</label>
          <select
            name="courseId"
            required
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Data de început</label>
          <input
            type="date"
            name="startAt"
            required
            defaultValue={toDateInputValue(today)}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Data de expirare</label>
          <input
            type="date"
            name="expiresAt"
            defaultValue={toDateInputValue(inOneYear)}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-400">Lasă gol pentru acces nelimitat.</p>
        </div>
        <button className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110">
          Acordă acces
        </button>
      </form>

      {/* ---------- Orders / invoices ---------- */}
      <h3 className="mt-10 text-lg font-semibold text-slate-900">Comenzi plătite</h3>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Dată</th>
              <th className="px-4 py-3 font-medium">Tip</th>
              <th className="px-4 py-3 font-medium">Produse</th>
              <th className="px-4 py-3 font-medium">Factură</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {user.orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 text-slate-600">{(o.paidAt ?? o.createdAt).toLocaleDateString("ro-RO")}</td>
                <td className="px-4 py-3 text-slate-600">{o.type === "COURSE" ? "Curs" : "Carte"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {o.items.map((i) => i.title || "Produs").join(", ") || (o.type === "COURSE" ? "Curs" : "Carte")}
                </td>
                <td className="px-4 py-3">
                  {o.invoice ? (
                    <span className="text-emerald-700">
                      {o.invoice.series}-{o.invoice.number}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">{formatRON(o.total)}</td>
              </tr>
            ))}
            {user.orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Nicio comandă plătită.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
