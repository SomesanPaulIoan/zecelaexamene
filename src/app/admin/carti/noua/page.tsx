import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUBJECT_LABELS } from "@/lib/subjects";
import { createBookAction } from "../actions";

export default async function AdminNewBookPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPERADMIN") redirect("/admin");

  const authors = await prisma.beneficiary.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/admin/carti" className="text-sm text-slate-500 hover:text-brand">
        ← Toate cărțile
      </Link>
      <h2 className="mt-2 text-xl font-bold text-slate-900">Carte nouă</h2>

      <form
        action={createBookAction}
        className="mt-6 grid gap-4 rounded-xl border border-slate-200 p-6 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Titlu</label>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Slug (opțional, generat automat)</label>
          <input
            name="slug"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Subiect</label>
          <select
            name="subject"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Autor</label>
          <select
            name="authorId"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Preț (RON)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="price"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Nr. pagini (opțional)</label>
          <input
            type="number"
            min="0"
            name="pages"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Ordine afișare (opțional)</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={0}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Descriere</label>
          <textarea
            name="description"
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Copertă (opțional)</label>
          <input type="file" name="cover" accept="image/*" className="mt-1 text-sm" />
        </div>

        <div className="sm:col-span-2">
          <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110">
            Creează cartea
          </button>
        </div>
      </form>
    </div>
  );
}
