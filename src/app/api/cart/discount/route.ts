import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { resolveDiscountCode } from "@/lib/discount";
import { getSiteOrigin } from "@/lib/site-url";

export async function POST(request: Request) {
  const origin = getSiteOrigin();
  const formData = await request.formData();
  const code = String(formData.get("code") ?? "");

  const discount = await resolveDiscountCode(code, "BOOK");
  const session = await getSession();
  session.discountCode = discount ? discount.code : undefined;
  await session.save();

  return NextResponse.redirect(`${origin}/cos${discount ? "" : "?invalid=1"}`, 303);
}
