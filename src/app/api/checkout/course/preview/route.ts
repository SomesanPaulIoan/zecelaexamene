import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveDiscountCode, applyDiscount } from "@/lib/discount";

// Live price recalculation for the course purchase popup — applies a discount code
// without creating an Order or touching Stripe, so the "Aplică" button can update the
// displayed total before the user commits to paying.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const courseId = String(body?.courseId ?? "");
  const discountCodeRaw = String(body?.discountCode ?? "").trim();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) {
    return NextResponse.json({ error: "Curs indisponibil." }, { status: 404 });
  }

  const subtotal = Number(course.salePrice ?? course.price);

  if (!discountCodeRaw) {
    return NextResponse.json({ subtotal, discountValue: 0, total: subtotal, valid: true });
  }

  const discount = await resolveDiscountCode(discountCodeRaw, "COURSE");
  if (!discount) {
    return NextResponse.json({ subtotal, discountValue: 0, total: subtotal, valid: false });
  }

  const { discountValue, total } = applyDiscount(subtotal, Number(discount.percent));
  return NextResponse.json({ subtotal, discountValue, total, valid: true });
}
