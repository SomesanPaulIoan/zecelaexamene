import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteOrigin } from "@/lib/site-url";

export async function POST(request: Request) {
  const origin = getSiteOrigin();
  const formData = await request.formData();
  const bookId = String(formData.get("bookId") ?? "");
  const qty = Math.max(1, parseInt(String(formData.get("qty") ?? "1"), 10) || 1);

  const session = await getSession();
  const cart = session.cart ?? [];
  const item = cart.find((i) => i.bookId === bookId);
  if (item) item.qty = qty;
  session.cart = cart;
  await session.save();

  return NextResponse.redirect(`${origin}/cos`, 303);
}
