import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Superadmin",
  TEACHER_ADMIN: "Admin profesor",
  CUSTOMER: "Client",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.role !== "SUPERADMIN") redirect("/admin");

  const { q, page: pageParam } = await searchParams;
  const query = (q ?? "").trim();
  const page = Math.max(1, Number(pageParam) || 1);

  const where = query
    ? {
        OR: [
          { email: { contains: query, mode: "insensitive" as const } },
          { firstName: { contains: query, mode: "insensitive" as const } },
          { lastName: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { courseAccess: true, orders: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => `/admin/utilizatori?${new URLSearchParams({ ...(query ? { q: query } : {}), page: String(p) })}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Utilizatori ({total})</h2>
        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Caută după nume sau email..."
            className="w-64 rounded-full border border-slate-300 px-4 py-1.5 text-sm focus:border-brand focus:outline-none"
          />
          <button className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
            Caută
          </button>
        </form>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nume</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium text-right">Cursuri</th>
              <th className="px-4 py-3 font-medium text-right">Comenzi</th>
              <th className="px-4 py-3 font-medium">Înregistrat</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-slate-900">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3 text-slate-600">{ROLE_LABELS[u.role] ?? u.role}</td>
                <td className="px-4 py-3 text-right text-slate-600">{u._count.courseAccess}</td>
                <td className="px-4 py-3 text-right text-slate-600">{u._count.orders}</td>
                <td className="px-4 py-3 text-slate-500">{u.createdAt.toLocaleDateString("ro-RO")}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/utilizatori/${u.id}`} className="font-medium text-brand hover:underline">
                    Vezi
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Niciun utilizator găsit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <Link
            href={pageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`rounded-full border border-slate-300 px-4 py-1.5 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:border-brand hover:text-brand"}`}
          >
            Anterior
          </Link>
          <span className="text-slate-500">
            Pagina {page} din {totalPages}
          </span>
          <Link
            href={pageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={`rounded-full border border-slate-300 px-4 py-1.5 ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:border-brand hover:text-brand"}`}
          >
            Următor
          </Link>
        </div>
      )}
    </div>
  );
}
