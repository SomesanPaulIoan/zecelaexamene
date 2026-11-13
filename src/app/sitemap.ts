import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Without this, Next tries to prerender /sitemap.xml at build time, which needs a live DB
// connection — the Docker build stage has none (DATABASE_URL points at the "postgres"
// service, unreachable outside the compose network), so the build fails. Forcing dynamic
// rendering defers the DB query to request time instead.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

  const [courses, books] = await Promise.all([
    prisma.course.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.book.findMany({ select: { slug: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/cursuri`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/carti`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/despre`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/termeni-si-conditii`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/politica-confidentialitate`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/politica-cookies`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/formular-retragere`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${siteUrl}/cursuri/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const bookRoutes: MetadataRoute.Sitemap = books.map((b) => ({
    url: `${siteUrl}/carti/${b.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...courseRoutes, ...bookRoutes];
}
