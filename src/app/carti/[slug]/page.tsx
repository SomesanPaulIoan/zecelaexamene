import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SUBJECT_LABELS, formatRON } from "@/lib/subjects";
import { subjectVisual } from "@/lib/subject-visuals";
import { BookGallery } from "@/components/book/BookGallery";
import { AddToCartForm } from "@/components/book/AddToCartForm";

type Props = { params: Promise<{ slug: string }> };

async function getBook(slug: string) {
  return prisma.book.findUnique({
    where: { slug },
    include: { author: true, images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) return {};
  const image = book.images[0]?.url ?? book.coverImageUrl ?? undefined;
  return {
    title: book.title,
    description: book.description ?? undefined,
    openGraph: {
      title: book.title,
      description: book.description ?? undefined,
      type: "website",
      images: image ? [{ url: image }] : [{ url: "/og-image.png", width: 2100, height: 600, alt: "Zece la Examene" }],
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

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) notFound();

  const visual = subjectVisual(book.subject);
  const images = book.images.length > 0 ? book.images.map((i) => i.url) : book.coverImageUrl ? [book.coverImageUrl] : [];

  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: book.title,
    description: book.description ?? book.title,
    image: images[0],
    brand: { "@type": "Brand", name: "Zece la Examene" },
    ...(book.author && { author: { "@type": "Person", name: book.author.name } }),
    offers: {
      "@type": "Offer",
      price: Number(book.price).toFixed(2),
      priceCurrency: "RON",
      url: `${siteUrl}/carti/${book.slug}`,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:self-start">
          {images.length > 0 ? (
            <BookGallery images={images} title={book.title} />
          ) : (
            <div className={`flex aspect-[3/4] items-center justify-center rounded-3xl ${visual.gradient} text-white/30`}>
              <div className="h-24 w-24">{visual.icon}</div>
            </div>
          )}
        </div>

        <div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${visual.text} ${visual.ring}`}
          >
            {SUBJECT_LABELS[book.subject]}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-900">{book.title}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
              {initials(book.author.name)}
            </span>
            <span className="text-sm font-medium text-slate-700">de {book.author.name}</span>
            {book.pages && <span className="text-sm text-slate-400">· {book.pages} pagini</span>}
          </div>

          {book.description && (
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-slate-700">
              {book.description}
            </p>
          )}

          <div className="mt-8 rounded-3xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Preț</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">{formatRON(book.price)}</p>
            <AddToCartForm bookId={book.id} unitPrice={Number(book.price)} accentSolid={visual.solid} />
          </div>

          <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${visual.solid}`} />
              Livrare prin curier, oriunde în România
            </li>
            <li className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${visual.solid}`} />
              Plată securizată prin card
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
