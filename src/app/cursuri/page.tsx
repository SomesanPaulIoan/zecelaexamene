import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SUBJECT_LABELS } from "@/lib/subjects";
import { subjectVisual } from "@/lib/subject-visuals";
import { CourseCard } from "@/components/CourseCard";

export const metadata: Metadata = {
  title: "Cursuri video pentru Bacalaureat și Admitere",
  description:
    "Cursuri video complete de Matematică, Limba Română și Istorie, create de profesori care chiar predau materia — recapitulare, curriculă completă și subiecte rezolvate.",
};

const SUBJECT_ORDER = ["MATEMATICA", "ROMANA", "ISTORIE", "FIZICA", "INFORMATICA"];

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: [{ subject: "asc" }, { sortOrder: "asc" }],
    include: { author: true, _count: { select: { parts: true } } },
  });

  const bySubject = new Map<string, typeof courses>();
  for (const course of courses) {
    const list = bySubject.get(course.subject) ?? [];
    list.push(course);
    bySubject.set(course.subject, list);
  }
  const subjectsPresent = SUBJECT_ORDER.filter((s) => bySubject.has(s));

  return (
    <div>
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.35),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.3),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(20,184,166,0.3),transparent_45%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80">
            Cursuri online
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Pregătire structurată, pe înțelesul tău
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Cursuri video complete pentru Bacalaureat și admiterea la facultate, create de
            profesori care chiar predau materia.
          </p>

          {subjectsPresent.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {subjectsPresent.map((subject) => {
                const visual = subjectVisual(subject);
                return (
                  <a
                    key={subject}
                    href={`#${subject.toLowerCase()}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/20"
                  >
                    <span className={`h-2 w-2 rounded-full ${visual.solid}`} />
                    {SUBJECT_LABELS[subject]}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {(() => {
          const visual = subjectVisual("INFORMATICA");
          return (
            <section id="informatica" className="scroll-mt-20 py-16">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${visual.gradient} p-2.5 text-white shadow-lg`}
                >
                  {visual.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Informatică</h2>
                  <p className="text-sm text-slate-500">Acum pe zecelainfo.ro</p>
                </div>
              </div>

              <div className={`mt-8 rounded-2xl border border-slate-200 ${visual.glow} p-6 sm:p-8`}>
                <p className="text-lg text-slate-800">
                  Cursurile de Informatică au un cămin nou:{" "}
                  <a
                    href="https://zecelainfo.ro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-semibold underline ${visual.text}`}
                  >
                    zecelainfo.ro
                  </a>
                  .
                </p>
                <p className="mt-3 text-slate-600">
                  Dacă aveai deja acces la cursurile de Informatică de pe această platformă, îl
                  poți transfera gratuit pe noul site: creează-ți un cont pe zecelainfo.ro, apoi
                  din <strong>Dashboard → Informațiile Contului</strong> poți prelua automat
                  cursurile la care aveai acces aici.
                </p>
                <a
                  href="https://zecelainfo.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-5 inline-flex items-center gap-2 rounded-full ${visual.solid} px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110`}
                >
                  Mergi la zecelainfo.ro
                </a>

                <p className="mt-5 text-sm text-slate-500">
                  Ne cerem scuze pentru eventualul inconvenient. Dacă întâmpini orice fel de
                  dificultăți, te rog să mă contactezi pe WhatsApp la{" "}
                  <a href="tel:+40744218696" className={`font-medium underline ${visual.text}`}>
                    0744 218 696
                  </a>{" "}
                  — Paul-Ioan Someșan.
                </p>
              </div>
            </section>
          );
        })()}

        {subjectsPresent.map((subject) => {
          const visual = subjectVisual(subject);
          const subjectCourses = bySubject.get(subject)!;
          return (
            <section key={subject} id={subject.toLowerCase()} className="scroll-mt-20 py-16">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${visual.gradient} p-2.5 text-white shadow-lg`}
                >
                  {visual.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{SUBJECT_LABELS[subject]}</h2>
                  <p className="text-sm text-slate-500">
                    {subjectCourses.length} {subjectCourses.length === 1 ? "curs" : "cursuri"}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {subjectCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={{
                      ...course,
                      description: course.description,
                      partsCount: course._count.parts,
                    }}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
