import Link from "next/link";
import { SUBJECT_LABELS, formatRON } from "@/lib/subjects";
import { subjectVisual } from "@/lib/subject-visuals";

export type CourseCardData = {
  slug: string;
  title: string;
  subject: string;
  price: number | string | { toString(): string };
  salePrice: number | string | { toString(): string } | null;
  description?: string | null;
  author?: { name: string } | null;
  partsCount?: number;
};

export function CourseCard({ course }: { course: CourseCardData }) {
  const visual = subjectVisual(course.subject);
  const onSale = course.salePrice != null;

  return (
    <Link
      href={`/cursuri/${course.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-xl"
    >
      <div className={`relative h-32 overflow-hidden ${visual.gradient}`}>
        <div className="absolute -right-4 -top-4 h-28 w-28 text-white/15 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          {visual.icon}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_60%)]" />
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
          {SUBJECT_LABELS[course.subject] ?? course.subject}
        </span>
        {onSale && (
          <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            Reducere
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-slate-700">
          {course.title}
        </h3>
        {course.author && (
          <p className="mt-1 text-sm text-slate-500">
            Predat de <span className="font-medium text-slate-700">{course.author.name}</span>
          </p>
        )}
        {course.description && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">{course.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            {course.partsCount ? (
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                {course.partsCount} module
              </p>
            ) : null}
            <p className="flex items-baseline gap-2">
              {onSale && (
                <span className="text-sm text-slate-400 line-through">{formatRON(course.price)}</span>
              )}
              <span className="text-xl font-extrabold text-slate-900">
                {formatRON(course.salePrice ?? course.price)}
              </span>
            </p>
          </div>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full ${visual.solid} text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
