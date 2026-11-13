import Link from "next/link";
import Image from "next/image";
import { SUBJECT_LABELS, formatRON } from "@/lib/subjects";
import { subjectVisual } from "@/lib/subject-visuals";

export type BookCardData = {
  slug: string;
  title: string;
  subject: string;
  price: number | string | { toString(): string };
  coverImageUrl: string | null;
  author?: { name: string } | null;
  pages?: number | null;
};

export function BookCard({ book }: { book: BookCardData }) {
  const visual = subjectVisual(book.subject);

  return (
    <Link
      href={`/carti/${book.slug}`}
      className="group flex overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[2/3] w-2/5 shrink-0 overflow-hidden bg-slate-100 sm:w-[42%]">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 40vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${visual.gradient} text-white/30`}>
            <div className="h-16 w-16">{visual.icon}</div>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
          {SUBJECT_LABELS[book.subject] ?? book.subject}
        </span>
        <h3 className="mt-3 line-clamp-3 text-base font-bold leading-snug text-slate-900 sm:text-lg">
          {book.title}
        </h3>
        {book.author && <p className="mt-1 text-sm text-slate-500">de {book.author.name}</p>}
        {book.pages ? <p className="mt-0.5 text-xs text-slate-400">{book.pages} pagini</p> : null}
        <p className="mt-auto pt-4 text-xl font-extrabold text-slate-900">{formatRON(book.price)}</p>
        <span className="mt-3 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-slate-700">
          Vezi mai mult →
        </span>
      </div>
    </Link>
  );
}
