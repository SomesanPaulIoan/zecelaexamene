import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getSiteOrigin } from "@/lib/site-url";

export async function POST(request: Request) {
  const origin = getSiteOrigin();
  const formData = await request.formData();
  const bookId = String(formData.get("bookId") ?? "");
  const qty = Math.max(1, parseInt(String(formData.get("qty") ?? "1"), 10) || 1);

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) return NextResponse.json({ error: "Carte indisponibilă." }, { status: 404 });

  const session = await getSession();
  const cart = session.cart ?? [];
  const existing = cart.find((i) => i.bookId === bookId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ bookId, qty });
  }
  session.cart = cart;
  await session.save();

  return NextResponse.redirect(`${origin}/cos`, 303);
}
