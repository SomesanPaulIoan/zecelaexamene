import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/CourseCard";
import { BookCard } from "@/components/BookCard";

export default async function HomePage() {
  const [courses, books, courseSubjects, bookSubjects, studentCount, reviewStats] =
    await Promise.all([
      prisma.course.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        take: 6,
        include: { author: true, _count: { select: { parts: true } } },
      }),
      prisma.book.findMany({
        orderBy: { sortOrder: "asc" },
        take: 4,
        include: { author: true },
      }),
      prisma.course.findMany({ where: { published: true }, distinct: ["subject"], select: { subject: true } }),
      prisma.book.findMany({ distinct: ["subject"], select: { subject: true } }),
      prisma.courseAccess.findMany({ distinct: ["userId"], select: { userId: true } }),
      prisma.review.aggregate({ where: { approved: true }, _avg: { stars: true }, _count: true }),
    ]);

  const subjectCount = new Set([
    ...courseSubjects.map((c) => c.subject),
    ...bookSubjects.map((b) => b.subject),
  ]).size;
  const avgRating = reviewStats._avg.stars ? reviewStats._avg.stars.toFixed(1) : null;

  return (
    <div>
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.3),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(20,184,166,0.3),transparent_45%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80">
            Platformă educațională
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Pregătire clară, structurată,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              care duce la rezultate
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Cursuri video și cărți de pregătire pentru Bacalaureat și admiterea la facultate,
            create de profesori care au ajutat deja mii de elevi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/cursuri"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
            >
              Explorează cursurile
            </Link>
            <Link
              href="/carti"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/5"
            >
              Vezi cărțile
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-10">
            <div>
              <p className="text-3xl font-extrabold text-white">
                {studentCount.length.toLocaleString("ro-RO")}+
              </p>
              <p className="mt-1 text-xs text-white/60">elevi cu acces la cursuri</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">{subjectCount}</p>
              <p className="mt-1 text-xs text-white/60">materii acoperite</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">
                {avgRating ? `${avgRating}★` : "—"}
              </p>
              <p className="mt-1 text-xs text-white/60">
                din {reviewStats._count} recenzii
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand">
              Cursuri
            </span>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">Cursuri populare</h2>
          </div>
          <Link href="/cursuri" className="text-sm font-semibold text-brand hover:underline">
            Toate cursurile →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={{ ...course, partsCount: course._count.parts }}
            />
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-700">
                Cărți
              </span>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">Cărți de pregătire</h2>
            </div>
            <Link href="/carti" className="text-sm font-semibold text-brand hover:underline">
              Toate cărțile →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
