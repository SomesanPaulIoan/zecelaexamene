import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SUBJECT_LABELS, formatRON } from "@/lib/subjects";
import { subjectVisual } from "@/lib/subject-visuals";
import { splitLines, formatDuration } from "@/lib/content";
import { getCurrentUser } from "@/lib/auth";
import { getCourseAccess } from "@/lib/course-access";
import { findTeamMember } from "@/lib/team";
import { SocialIcon } from "@/components/SocialIcon";
import { CourseTabs, type OverviewBlock } from "@/components/course/CourseTabs";
import { CoursePurchaseModal } from "@/components/course/CoursePurchaseModal";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cod_invalid?: string }>;
};

async function getCourse(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      author: true,
      parts: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: { videos: { where: { published: true }, orderBy: { sortOrder: "asc" } } },
      },
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.description ?? undefined,
    openGraph: {
      title: course.title,
      description: course.description ?? undefined,
      type: "website",
      images: [{ url: "/og-image.png", width: 2100, height: 600, alt: "Zece la Examene" }],
    },
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default async function CourseDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { cod_invalid } = await searchParams;
  const course = await getCourse(slug);
  if (!course || !course.published) notFound();

  const [user] = await Promise.all([getCurrentUser()]);
  const access = await getCourseAccess(user?.id ?? null, course.id);
  const hasAccess = Boolean(access && (!access.expiresAt || access.expiresAt > new Date()));
  const teacher = findTeamMember(course.author?.name);

  const visual = subjectVisual(course.subject);
  const price = course.salePrice ?? course.price;
  const onSale = course.salePrice != null;

  const totalVideos = course.parts.reduce((sum, p) => sum + p.videos.length, 0);
  const totalSeconds = course.parts.reduce(
    (sum, p) => sum + p.videos.reduce((s, v) => s + (v.durationSec ?? 0), 0),
    0
  );
  const avgStars = course.reviews.length
    ? course.reviews.reduce((s, r) => s + r.stars, 0) / course.reviews.length
    : 0;

  const overviewBlocks: OverviewBlock[] = [
    { title: "Cui se adresează", icon: "🎯", items: splitLines(course.audience) },
    { title: "Ce conține", icon: "📦", items: splitLines(course.courseContent) },
    { title: "Cerințe", icon: "✅", items: splitLines(course.requirements) },
    { title: "Ce vei obține", icon: "🏁", items: splitLines(course.outcomes) },
    { title: "Bonusuri", icon: "🎁", items: splitLines(course.bonuses) },
  ].filter((b) => b.items.length > 0);

  const PurchaseCard = (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
      {hasAccess ? (
        <>
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" />
            </svg>
            Ai acces la acest curs
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Deschide tab-ul „Curriculă&rdquo; mai jos și apasă pe orice lecție pentru a o viziona.
          </p>
          {access?.expiresAt && (
            <p className="mt-2 text-sm text-slate-500">
              Ai acces până la{" "}
              <strong className="text-slate-700">
                {access.expiresAt.toLocaleDateString("ro-RO")}
              </strong>
              .
            </p>
          )}
          {course.resourceFileName && (
            <a
              href={`/api/cursuri/${course.slug}/resurse`}
              className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full ${visual.solid} px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10 2a1 1 0 011 1v8.59l2.3-2.3a1 1 0 111.4 1.42l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.42l2.3 2.3V3a1 1 0 011-1zM4 16a1 1 0 011 1v1a1 1 0 001 1h8a1 1 0 001-1v-1a1 1 0 112 0v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1a1 1 0 011-1z" />
              </svg>
              Descarcă resursele cursului
            </a>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-slate-500">Preț curs</p>
          <p className="mt-1 flex items-baseline gap-2">
            {onSale && <span className="text-lg text-slate-400 line-through">{formatRON(course.price)}</span>}
            <span className="text-3xl font-extrabold text-slate-900">{formatRON(price)}</span>
          </p>

          <div className="mt-5">
            {user ? (
              <CoursePurchaseModal
                courseId={course.id}
                subtotal={Number(price)}
                buttonClass={`w-full rounded-full ${visual.solid} px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110`}
                prefill={{
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  county: user.billingCounty ?? "",
                  city: user.billingCity ?? "",
                  street: user.billingStreet ?? "",
                }}
                initialInvalidCode={Boolean(cod_invalid)}
              />
            ) : (
              <Link
                href="/login"
                className={`block w-full rounded-full ${visual.solid} px-6 py-3.5 text-center text-sm font-semibold text-white shadow-md transition hover:brightness-110`}
              >
                Autentifică-te pentru a cumpăra
              </Link>
            )}
          </div>
        </>
      )}

      <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
        <li className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${visual.solid}`} />
          Acces 1 an de la achiziție
        </li>
        {totalVideos > 0 && (
          <li className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${visual.solid}`} />
            {totalVideos} lecții video · {formatDuration(totalSeconds)}
          </li>
        )}
        {course.parts.length > 0 && (
          <li className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${visual.solid}`} />
            {course.parts.length} module de conținut
          </li>
        )}
      </ul>
    </div>
  );

  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description ?? course.title,
    provider: {
      "@type": "Organization",
      name: "Zece la Examene",
      sameAs: siteUrl,
    },
    ...(course.author && {
      instructor: { "@type": "Person", name: course.author.name },
    }),
    ...(course.reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgStars.toFixed(1),
        reviewCount: course.reviews.length,
      },
    }),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
    },
    offers: {
      "@type": "Offer",
      price: Number(price).toFixed(2),
      priceCurrency: "RON",
      url: `${siteUrl}/cursuri/${course.slug}`,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <section className={`relative overflow-hidden ${visual.gradient}`}>
        <div className="absolute -right-10 -top-10 h-72 w-72 text-white/10">{visual.icon}</div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800">
            {SUBJECT_LABELS[course.subject]}
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
            {course.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-5">
            {course.author && (
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white ring-1 ring-white/40">
                  {initials(course.author.name)}
                </span>
                <span className="text-sm font-medium text-white/90">
                  Predat de {course.author.name}
                </span>
              </div>
            )}
            {course.reviews.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-white/90">
                <svg viewBox="0 0 20 20" fill="#fbbf24" className="h-4 w-4">
                  <path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1z" />
                </svg>
                {avgStars.toFixed(1)} ({course.reviews.length} recenzii)
              </div>
            )}
            {totalVideos > 0 && (
              <div className="text-sm font-medium text-white/90">
                {totalVideos} lecții · {formatDuration(totalSeconds)}
              </div>
            )}
          </div>

          {/* Purchase card, mobile only — shown inline right under the hero */}
          <div className="mt-8 lg:hidden">{PurchaseCard}</div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {course.description && (
            <p className="text-lg leading-relaxed text-slate-700">{course.description}</p>
          )}

          <div className="mt-8">
            <CourseTabs
              overviewBlocks={overviewBlocks}
              contentHtml={course.contentHtml}
              parts={course.parts.map((p) => ({
                id: p.id,
                title: p.title,
                summary: p.summary,
                videos: p.videos.map((v) => ({
                  id: v.id,
                  title: v.title,
                  vimeoId: v.vimeoId,
                  durationSec: v.durationSec,
                  isFreePreview: v.isFreePreview,
                })),
              }))}
              reviews={course.reviews.map((r) => ({
                id: r.id,
                authorName: r.authorName,
                stars: r.stars,
                comment: r.comment,
              }))}
              hasAccess={hasAccess}
              accentSolid={visual.solid}
              accentGradient={visual.gradient}
              accentText={visual.text}
            />
          </div>

          {teacher && (
            <div className="mt-10 rounded-3xl border border-slate-200 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Despre profesor
              </p>
              <div className="mt-4 flex gap-4">
                {teacher.photo ? (
                  <Image
                    src={teacher.photo}
                    alt={teacher.name}
                    width={88}
                    height={88}
                    className={`h-[88px] w-[88px] flex-none rounded-full object-cover ring-2 ${visual.ring}`}
                  />
                ) : (
                  <div
                    className={`flex h-[88px] w-[88px] flex-none items-center justify-center rounded-full text-xl font-bold text-white ${visual.solid}`}
                  >
                    {initials(teacher.name)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900">{teacher.name}</p>
                  <p className={`text-sm font-medium ${visual.text}`}>{teacher.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{teacher.bio}</p>
                  {(teacher.facebook || teacher.instagram || teacher.linkedin) && (
                    <div className="mt-3 flex gap-3 text-slate-400">
                      {teacher.facebook && (
                        <a
                          href={teacher.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-slate-700"
                        >
                          <SocialIcon type="facebook" />
                        </a>
                      )}
                      {teacher.instagram && (
                        <a
                          href={teacher.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-slate-700"
                        >
                          <SocialIcon type="instagram" />
                        </a>
                      )}
                      {teacher.linkedin && (
                        <a
                          href={teacher.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-slate-700"
                        >
                          <SocialIcon type="linkedin" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Purchase card, desktop — sticky in the sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24">{PurchaseCard}</div>
        </div>
      </div>
    </div>
  );
}
