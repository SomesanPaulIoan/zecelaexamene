import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SUBJECT_LABELS } from "@/lib/subjects";
import { subjectVisual } from "@/lib/subject-visuals";
import { BookCard } from "@/components/BookCard";

export const metadata: Metadata = {
  title: "Cărți de pregătire pentru Bacalaureat și Admitere",
  description:
    "Sinteze, exerciții și grile scrise de profesorii care predau cursurile — cărți de Matematică, Limba Română, Istorie, Biologie și Informatică, livrate acasă oriunde în țară.",
};

const SUBJECT_ORDER = ["INFORMATICA", "ISTORIE", "BIOLOGIE"];

export default async function BooksPage() {
  const books = await prisma.book.findMany({
    orderBy: { sortOrder: "asc" },
    include: { author: true },
  });

  const bySubject = new Map<string, typeof books>();
  for (const book of books) {
    const list = bySubject.get(book.subject) ?? [];
    list.push(book);
    bySubject.set(book.subject, list);
  }
  const subjectsPresent = SUBJECT_ORDER.filter((s) => bySubject.has(s));

  return (
    <div>
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(99,102,241,0.35),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(20,184,166,0.3),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.25),transparent_45%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80">
            Cărți de pregătire
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Materia, explicată clar, pe hârtie
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Sinteze, exerciții și grile scrise chiar de profesorii care predau cursurile —
            livrate acasă, oriunde în țară.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {subjectsPresent.map((subject) => {
          const visual = subjectVisual(subject);
          const subjectBooks = bySubject.get(subject)!;
          return (
            <section key={subject} className="py-16">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${visual.gradient} p-2.5 text-white shadow-lg`}
                >
                  {visual.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{SUBJECT_LABELS[subject]}</h2>
                  <p className="text-sm text-slate-500">
                    {subjectBooks.length} {subjectBooks.length === 1 ? "carte" : "cărți"}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {subjectBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
