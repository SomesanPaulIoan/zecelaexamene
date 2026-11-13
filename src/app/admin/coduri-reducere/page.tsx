import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDiscountCodeAction, toggleDiscountCodeAction, deleteDiscountCodeAction } from "./actions";

const SCOPE_LABELS: Record<string, string> = {
  BOOK: "Doar cărți",
  COURSE: "Doar cursuri",
  ALL: "Cărți și cursuri",
};

export default async function AdminDiscountCodesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPERADMIN") redirect("/admin");

  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Coduri de reducere</h2>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Cod</th>
              <th className="px-4 py-3 font-medium">Procent</th>
              <th className="px-4 py-3 font-medium">Domeniu</th>
              <th className="px-4 py-3 font-medium">Expiră</th>
              <th className="px-4 py-3 font-medium">Folosiri</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {codes.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-mono font-medium text-slate-900">{c.code}</td>
                <td className="px-4 py-3 text-slate-600">{c.percent.toString()}%</td>
                <td className="px-4 py-3 text-slate-600">{SCOPE_LABELS[c.scope] ?? c.scope}</td>
                <td className="px-4 py-3 text-slate-600">
                  {c.expiresAt ? c.expiresAt.toLocaleDateString("ro-RO") : "Nelimitat"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {c.timesRedeemed}
                  {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}
                </td>
                <td className="px-4 py-3">
                  <span className={c.active ? "text-emerald-600" : "text-slate-400"}>
                    {c.active ? "Activ" : "Dezactivat"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <form action={toggleDiscountCodeAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-slate-600 hover:underline">
                        {c.active ? "Dezactivează" : "Activează"}
                      </button>
                    </form>
                    <form action={deleteDiscountCodeAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-rose-600 hover:underline">Șterge</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {codes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Niciun cod de reducere.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form
        action={createDiscountCodeAction}
        className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <div>
          <label className="block text-xs font-medium text-slate-500">Cod</label>
          <input
            name="code"
            required
            placeholder="EX: REDUCERE10"
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Procent</label>
          <input
            type="number"
            name="percent"
            min="1"
            max="100"
            required
            className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Domeniu</label>
          <select
            name="scope"
            defaultValue="ALL"
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            <option value="ALL">Cărți și cursuri</option>
            <option value="BOOK">Doar cărți</option>
            <option value="COURSE">Doar cursuri</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Expiră (opțional)</label>
          <input
            type="date"
            name="expiresAt"
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Nr. maxim folosiri (opțional)</label>
          <input
            type="number"
            name="maxRedemptions"
            min="1"
            className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <button className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110">
          Creează cod
        </button>
      </form>
    </div>
  );
}
