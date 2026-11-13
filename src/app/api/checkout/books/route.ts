import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getSession } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth";
import { resolveDiscountCode, applyDiscount } from "@/lib/discount";
import { shippingCost, codFee, type PaymentMethod, type ShippingMethod } from "@/lib/shipping";
import { fulfillCodOrder } from "@/lib/order-fulfillment";
import { getSiteOrigin } from "@/lib/site-url";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function POST(request: Request) {
  const origin = getSiteOrigin();
  const session = await getSession();
  const cartItems = session.cart ?? [];
  if (cartItems.length === 0) {
    return NextResponse.redirect(`${origin}/cos`, 303);
  }

  const formData = await request.formData();

  const billingType = field(formData, "billingType") === "company" ? "company" : "pf";
  const shipMethod: ShippingMethod = field(formData, "shipMethod") === "courier" ? "courier" : "sameday_easybox";
  const paymentMethod: PaymentMethod = field(formData, "paymentMethod") === "cod" ? "cod" : "card";

  // ---------- Billing ----------
  // City/county/street are mandatory for every order — SmartBill can't issue a valid
  // invoice without them, and unlike shipping (skipped entirely for easyBox pickup),
  // billing address is always required regardless of delivery method.
  let billingName = "";
  let billingEmail = "";
  let billingPhone = "";
  let billingAddress = "";
  let billingCity = "";
  let billingCounty = "";
  let billingCompany: string | undefined;
  let billingCui: string | undefined;
  let billingRegCom: string | undefined;

  if (billingType === "pf") {
    const lastName = field(formData, "pfLastName");
    const firstName = field(formData, "pfFirstName");
    billingEmail = field(formData, "pfEmail");
    billingPhone = field(formData, "pfPhone");
    billingAddress = field(formData, "pfAddress");
    billingCity = field(formData, "pfCity");
    billingCounty = field(formData, "pfCounty");
    if (!lastName || !firstName || !billingEmail || !billingPhone || !billingAddress || !billingCity || !billingCounty) {
      return NextResponse.json({ error: "Completează toate câmpurile obligatorii de facturare." }, { status: 400 });
    }
    billingName = `${firstName} ${lastName}`.trim();
  } else {
    billingCompany = field(formData, "coName");
    billingCui = field(formData, "coCui");
    billingRegCom = field(formData, "coRegCom") || undefined;
    billingAddress = field(formData, "coAddress");
    billingCity = field(formData, "coCity");
    billingCounty = field(formData, "coCounty");
    billingEmail = field(formData, "coEmail");
    billingPhone = field(formData, "coPhone");
    if (!billingCompany || !billingCui || !billingEmail || !billingPhone || !billingAddress || !billingCity || !billingCounty) {
      return NextResponse.json({ error: "Completează toate câmpurile obligatorii de facturare (firmă)." }, { status: 400 });
    }
    billingName = billingCompany;
  }

  // ---------- Shipping ----------
  let shippingAddress: string | undefined;
  let shippingCity: string | undefined;
  let shippingCounty: string | undefined;
  let shippingPostal: string | undefined;
  let shippingNotes: string | undefined;
  let lockerId: string | undefined;
  let lockerName: string | undefined;
  let lockerAddress: string | undefined;
  let lockerCity: string | undefined;
  let lockerCounty: string | undefined;
  let lockerPostal: string | undefined;
  let lockerOohType: string | undefined;
  let lockerLat: number | undefined;
  let lockerLng: number | undefined;
  let recipientName = "";
  let recipientPhone = "";

  if (shipMethod === "courier") {
    recipientName = field(formData, "shipName");
    recipientPhone = field(formData, "shipPhone");
    shippingCounty = field(formData, "shipCounty");
    shippingCity = field(formData, "shipCity");
    shippingAddress = field(formData, "shipAddress1");
    shippingPostal = field(formData, "shipPostal") || undefined;
    const address2 = field(formData, "shipAddress2");
    shippingNotes = [address2, field(formData, "shipNotes")].filter(Boolean).join(" | ") || undefined;
    if (!recipientName || !recipientPhone || !shippingCounty || !shippingCity || !shippingAddress) {
      return NextResponse.json({ error: "Completează toate câmpurile obligatorii de livrare." }, { status: 400 });
    }
  } else {
    recipientName = field(formData, "ezName");
    recipientPhone = field(formData, "ezPhone");
    lockerId = field(formData, "lockerId");
    lockerName = field(formData, "lockerName") || undefined;
    lockerAddress = field(formData, "lockerAddress") || undefined;
    lockerCity = field(formData, "lockerCity") || undefined;
    lockerCounty = field(formData, "lockerCounty") || undefined;
    lockerPostal = field(formData, "lockerPostal") || undefined;
    lockerOohType = field(formData, "lockerOohType") || undefined;
    const latRaw = field(formData, "lockerLat");
    const lngRaw = field(formData, "lockerLng");
    lockerLat = latRaw ? Number(latRaw) : undefined;
    lockerLng = lngRaw ? Number(lngRaw) : undefined;
    if (!recipientName || !recipientPhone || !lockerId) {
      return NextResponse.json({ error: "Selectează un locker easyBox și completează datele destinatarului." }, { status: 400 });
    }
    // Order-level shipping snapshot mirrors the locker address, same as the legacy site.
    shippingAddress = lockerAddress;
    shippingCity = lockerCity;
    shippingCounty = lockerCounty;
    shippingPostal = lockerPostal;
    shippingNotes = `easyBox: ${lockerName} (ID: ${lockerId})`;
  }

  // ---------- Cart + pricing (server-authoritative, mirrors legacy save_checkout.php) ----------
  const books = await prisma.book.findMany({ where: { id: { in: cartItems.map((i) => i.bookId) } } });
  const items = cartItems
    .map((item) => {
      const book = books.find((b) => b.id === item.bookId);
      if (!book) return null;
      return { book, qty: item.qty, lineTotal: Number(book.price) * item.qty };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);
  if (items.length === 0) {
    return NextResponse.redirect(`${origin}/cos`, 303);
  }

  const subtotal = items.reduce((sum, l) => sum + l.lineTotal, 0);
  const discount = await resolveDiscountCode(session.discountCode, "BOOK");
  const { discountValue, total: totalBeforeShipping } = applyDiscount(subtotal, discount ? Number(discount.percent) : null);
  const discountFactor = subtotal > 0 ? totalBeforeShipping / subtotal : 1;

  const shipping = shippingCost(subtotal, shipMethod);
  const cod = codFee(paymentMethod);
  const total = totalBeforeShipping + shipping + cod;

  const user = await getCurrentUser();

  const order = await prisma.order.create({
    data: {
      userId: user?.id,
      type: "BOOK",
      status: paymentMethod === "cod" ? "PAID" : "PENDING",
      subtotal,
      discountValue,
      shippingCost: shipping,
      codFee: cod,
      total,
      discountCodeId: discount?.id,
      billingType,
      billingName,
      billingEmail,
      billingPhone,
      billingAddress,
      billingCity,
      billingCounty,
      billingCompany,
      billingCui,
      billingRegCom,
      paymentMethod,
      shippingMethod: shipMethod,
      shippingRecipientName: recipientName,
      shippingRecipientPhone: recipientPhone,
      shippingAddress,
      shippingCity,
      shippingCounty,
      shippingPostal,
      shippingNotes,
      lockerId,
      lockerName,
      lockerAddress,
      lockerCity,
      lockerCounty,
      lockerPostal,
      lockerOohType,
      lockerLat,
      lockerLng,
      items: {
        create: items.map((l) => ({
          bookId: l.book.id,
          title: l.book.title,
          unitPrice: l.book.price,
          qty: l.qty,
          lineTotal: Math.round(l.lineTotal * discountFactor * 100) / 100,
        })),
      },
    },
  });

  if (discount) {
    await prisma.discountCode.update({
      where: { id: discount.id },
      data: { timesRedeemed: { increment: 1 } },
    });
  }

  session.cart = [];
  session.discountCode = undefined;
  await session.save();

  // ---------- Ramburs: no Stripe, order is already PAID — fulfill immediately ----------
  if (paymentMethod === "cod") {
    await fulfillCodOrder(order.id);
    return NextResponse.redirect(`${origin}/checkout/succes?order_id=${order.id}`, 303);
  }

  // ---------- Card: Stripe Checkout, including a shipping line item ----------
  const stripe = getStripe();
  const lineItems = items.map((l) => ({
    price_data: {
      currency: "ron",
      product_data: { name: l.book.title },
      unit_amount: Math.round(Number(l.book.price) * discountFactor * 100),
    },
    quantity: l.qty,
  }));
  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency: "ron",
        product_data: { name: shipMethod === "sameday_easybox" ? "Transport easyBox" : "Transport curier" },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: billingEmail,
    client_reference_id: order.id,
    line_items: lineItems,
    metadata: { orderId: order.id, orderType: "BOOK" },
    success_url: `${origin}/checkout/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cos`,
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: checkoutSession.id } });

  return NextResponse.redirect(checkoutSession.url!, 303);
}
