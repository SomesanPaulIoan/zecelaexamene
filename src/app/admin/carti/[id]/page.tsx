import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUBJECT_LABELS } from "@/lib/subjects";
import { BookImageSorter } from "@/components/admin/BookImageSorter";
import {
  updateBookAction,
  deleteBookAction,
  addBookImageAction,
  deleteBookImageAction,
  reorderBookImagesAction,
} from "../actions";

export default async function AdminEditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPERADMIN") redirect("/admin");

  const { id } = await params;
  const [book, authors] = await Promise.all([
    prisma.book.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    prisma.beneficiary.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!book) notFound();

  return (
    <div>
      <Link href="/admin/carti" className="text-sm text-slate-500 hover:text-brand">
        ← Toate cărțile
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{book.title}</h2>
        <form action={deleteBookAction}>
          <input type="hidden" name="id" value={book.id} />
          <button className="text-sm text-rose-600 hover:underline">Șterge cartea</button>
        </form>
      </div>

      <form
        action={updateBookAction}
        className="mt-6 grid gap-4 rounded-xl border border-slate-200 p-6 sm:grid-cols-2"
      >
        <input type="hidden" name="id" value={book.id} />
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Titlu</label>
          <input
            name="title"
            required
            defaultValue={book.title}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Slug</label>
          <input
            name="slug"
            defaultValue={book.slug}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Subiect</label>
          <select
            name="subject"
            required
            defaultValue={book.subject}
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
            defaultValue={book.authorId}
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
            defaultValue={book.price.toString()}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Nr. pagini (opțional)</label>
          <input
            type="number"
            min="0"
            name="pages"
            defaultValue={book.pages ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Ordine afișare</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={book.sortOrder}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Descriere</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={book.description ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Înlocuiește coperta (opțional)</label>
          {book.coverImageUrl && (
            <Image
              src={book.coverImageUrl}
              alt={book.title}
              width={64}
              height={90}
              className="mt-2 rounded object-cover"
            />
          )}
          <input type="file" name="cover" accept="image/*" className="mt-2 text-sm" />
        </div>

        <div className="sm:col-span-2">
          <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110">
            Salvează modificările
          </button>
        </div>
      </form>

      <h3 className="mt-8 text-base font-semibold text-slate-900">Galerie imagini</h3>
      <BookImageSorter
        key={book.images.map((i) => i.id).sort().join(",")}
        bookId={book.id}
        images={book.images.map((i) => ({ id: i.id, url: i.url }))}
        deleteAction={deleteBookImageAction}
        reorderAction={reorderBookImagesAction}
      />

      <form
        action={addBookImageAction}
        className="mt-4 flex items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <input type="hidden" name="bookId" value={book.id} />
        <div>
          <label className="block text-xs font-medium text-slate-500">Adaugă imagine în galerie</label>
          <input type="file" name="image" accept="image/*" required className="mt-1 text-sm" />
        </div>
        <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand hover:text-brand">
          Adaugă
        </button>
      </form>
    </div>
  );
}
