"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { saveUploadedImage } from "@/lib/uploads";

const SUBJECTS = ["INFORMATICA", "MATEMATICA", "ROMANA", "ISTORIE", "BIOLOGIE"] as const;

function str(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "carte";
  let slug = root;
  let n = 1;
  while (await prisma.book.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

function readBookFields(formData: FormData) {
  const title = str(formData, "title");
  const subject = str(formData, "subject");
  const authorId = str(formData, "authorId");
  const description = str(formData, "description") || null;
  const pagesRaw = str(formData, "pages");
  const priceRaw = str(formData, "price");
  const sortOrderRaw = str(formData, "sortOrder");

  if (!title || !authorId || !SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) {
    throw new Error("Completează titlul, subiectul și autorul.");
  }
  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Introdu un preț valid.");
  }

  return {
    title,
    subject: subject as (typeof SUBJECTS)[number],
    authorId,
    description,
    pages: pagesRaw ? Number(pagesRaw) : null,
    price,
    sortOrder: sortOrderRaw ? Number(sortOrderRaw) : 0,
  };
}

export async function createBookAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const fields = readBookFields(formData);
  const slug = await uniqueSlug(str(formData, "slug") || fields.title);
  const coverUrl = await saveUploadedImage(formData.get("cover") as File | null, "books");

  const book = await prisma.book.create({
    data: { ...fields, slug, coverImageUrl: coverUrl },
  });

  revalidatePath("/admin/carti");
  redirect(`/admin/carti/${book.id}`);
}

export async function updateBookAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const id = str(formData, "id");
  const fields = readBookFields(formData);
  const slugInput = str(formData, "slug");
  const slug = slugInput ? await uniqueSlug(slugInput, id) : undefined;
  const coverUrl = await saveUploadedImage(formData.get("cover") as File | null, "books");

  await prisma.book.update({
    where: { id },
    data: { ...fields, ...(slug ? { slug } : {}), ...(coverUrl ? { coverImageUrl: coverUrl } : {}) },
  });

  revalidatePath("/admin/carti");
  revalidatePath(`/admin/carti/${id}`);
}

export async function deleteBookAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const id = str(formData, "id");
  await prisma.bookImage.deleteMany({ where: { bookId: id } });
  await prisma.book.delete({ where: { id } });

  revalidatePath("/admin/carti");
  redirect("/admin/carti");
}

export async function addBookImageAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const bookId = str(formData, "bookId");
  const url = await saveUploadedImage(formData.get("image") as File | null, "books");
  if (!url) throw new Error("Selectează o imagine.");

  const maxSort = await prisma.bookImage.aggregate({ where: { bookId }, _max: { sortOrder: true } });
  await prisma.bookImage.create({
    data: { bookId, url, sortOrder: (maxSort._max.sortOrder ?? -1) + 1 },
  });

  revalidatePath(`/admin/carti/${bookId}`);
}

export async function deleteBookImageAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const id = str(formData, "id");
  const bookId = str(formData, "bookId");
  await prisma.bookImage.delete({ where: { id } });

  revalidatePath(`/admin/carti/${bookId}`);
}

export async function reorderBookImagesAction(bookId: string, orderedIds: string[]) {
  await requireRole(["SUPERADMIN"]);

  const existing = await prisma.bookImage.findMany({ where: { bookId }, select: { id: true } });
  const known = new Set(existing.map((i) => i.id));
  if (orderedIds.length !== known.size || !orderedIds.every((id) => known.has(id))) {
    throw new Error("Lista de imagini nu mai este actuală — reîncarcă pagina.");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.bookImage.update({ where: { id }, data: { sortOrder: index } })),
  );

  const book = await prisma.book.findUnique({ where: { id: bookId }, select: { slug: true } });
  revalidatePath(`/admin/carti/${bookId}`);
  if (book) revalidatePath(`/carti/${book.slug}`);
}
