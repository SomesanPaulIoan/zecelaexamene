import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUBJECT_LABELS, formatRON } from "@/lib/subjects";

export default async function AdminBooksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPERADMIN") redirect("/admin");

  const books = await prisma.book.findMany({
    orderBy: [{ subject: "asc" }, { sortOrder: "asc" }],
    include: { author: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Cărți ({books.length})</h2>
        <Link
          href="/admin/carti/noua"
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          Adaugă carte
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium"></th>
              <th className="px-4 py-3 font-medium">Titlu</th>
              <th className="px-4 py-3 font-medium">Subiect</th>
              <th className="px-4 py-3 font-medium">Autor</th>
              <th className="px-4 py-3 font-medium text-right">Preț</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {books.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-2">
                  <div className="h-14 w-10 overflow-hidden rounded bg-slate-100">
                    {b.coverImageUrl && (
                      <Image src={b.coverImageUrl} alt={b.title} width={40} height={56} className="h-full w-full object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-900">{b.title}</td>
                <td className="px-4 py-3 text-slate-600">{SUBJECT_LABELS[b.subject]}</td>
                <td className="px-4 py-3 text-slate-600">{b.author.name}</td>
                <td className="px-4 py-3 text-right text-slate-600">{formatRON(b.price)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/carti/${b.id}`} className="font-medium text-brand hover:underline">
                    Editează
                  </Link>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Nicio carte încă.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
