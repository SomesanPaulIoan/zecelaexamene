import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteOrigin } from "@/lib/site-url";

export async function POST(request: Request) {
  const origin = getSiteOrigin();
  const formData = await request.formData();
  const bookId = String(formData.get("bookId") ?? "");

  const session = await getSession();
  session.cart = (session.cart ?? []).filter((i) => i.bookId !== bookId);
  await session.save();

  return NextResponse.redirect(`${origin}/cos`, 303);
}
