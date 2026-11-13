import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { fulfillPaidOrder } from "@/lib/order-fulfillment";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  // Handle both events, gated on payment_status — with delayed-notification payment
  // methods, `checkout.session.completed` can fire while the session is still `unpaid`;
  // fulfilling on it alone would grant access before the payment actually succeeds.
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const checkoutSession = event.data.object as {
      id: string;
      payment_intent: string | null;
      payment_status: string;
    };
    if (checkoutSession.payment_status !== "unpaid") {
      await fulfillPaidOrder(checkoutSession.id, checkoutSession.payment_intent);
    }
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const checkoutSession = event.data.object as { id: string };
    await prisma.order
      .update({ where: { stripeSessionId: checkoutSession.id }, data: { status: "FAILED" } })
      .catch(() => {}); // order may not exist if this session was from an unrelated integration
  }

  return NextResponse.json({ received: true });
}
