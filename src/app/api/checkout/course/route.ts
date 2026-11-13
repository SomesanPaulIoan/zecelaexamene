import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { resolveDiscountCode, applyDiscount } from "@/lib/discount";
import { getSiteOrigin } from "@/lib/site-url";

export async function POST(request: Request) {
  const origin = getSiteOrigin();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login`, 303);
  }

  const formData = await request.formData();
  const courseId = String(formData.get("courseId") ?? "");
  const discountCodeRaw = String(formData.get("discountCode") ?? "").trim();
  const digitalContentConsent = formData.get("digitalContentConsent");
  if (!digitalContentConsent) {
    return NextResponse.json(
      { error: "Trebuie să confirmi acordul privind începerea furnizării conținutului digital." },
      { status: 400 }
    );
  }

  const billingFirstName = String(formData.get("billingFirstName") ?? "").trim() || user.firstName;
  const billingLastName = String(formData.get("billingLastName") ?? "").trim() || user.lastName;
  const billingEmail = String(formData.get("billingEmail") ?? "").trim() || user.email;
  const billingCounty = String(formData.get("billingCounty") ?? "").trim();
  const billingCity = String(formData.get("billingCity") ?? "").trim();
  const billingAddress = String(formData.get("billingAddress") ?? "").trim();
  if (!billingCounty || !billingCity || !billingAddress) {
    return NextResponse.json(
      { error: "Județul, localitatea și adresa de facturare sunt obligatorii." },
      { status: 400 }
    );
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) {
    return NextResponse.json({ error: "Curs indisponibil." }, { status: 404 });
  }

  const discount = await resolveDiscountCode(discountCodeRaw, "COURSE");
  if (discountCodeRaw && !discount) {
    return NextResponse.redirect(`${origin}/cursuri/${course.slug}?cod_invalid=1`, 303);
  }

  const subtotal = Number(course.salePrice ?? course.price);
  const { discountValue, total } = applyDiscount(subtotal, discount ? Number(discount.percent) : null);

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      type: "COURSE",
      status: "PENDING",
      subtotal,
      discountValue,
      total,
      discountCodeId: discount?.id,
      billingName: `${billingFirstName} ${billingLastName}`,
      billingEmail,
      billingCounty,
      billingCity,
      billingAddress,
      items: {
        create: [{ courseId: course.id, title: course.title, unitPrice: subtotal, qty: 1, lineTotal: total }],
      },
    },
  });

  if (discount) {
    await prisma.discountCode.update({
      where: { id: discount.id },
      data: { timesRedeemed: { increment: 1 } },
    });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: billingEmail,
    client_reference_id: order.id,
    line_items: [
      {
        price_data: {
          currency: "ron",
          product_data: { name: course.title },
          unit_amount: Math.round(total * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { orderId: order.id, orderType: "COURSE" },
    success_url: `${origin}/checkout/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cursuri/${course.slug}`,
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });

  return NextResponse.redirect(session.url!, 303);
}
