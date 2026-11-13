import Link from "next/link";
import type { Metadata } from "next";
import { getStripe } from "@/lib/stripe";
import { fulfillPaidOrder } from "@/lib/order-fulfillment";
import { prisma } from "@/lib/prisma";
import { formatRON } from "@/lib/subjects";

export const metadata: Metadata = { title: "Mulțumim pentru comandă" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; order_id?: string }>;
}) {
  const { session_id, order_id } = await searchParams;

  let order = session_id
    ? await prisma.order.findUnique({ where: { stripeSessionId: session_id } })
    : order_id
      ? await prisma.order.findUnique({ where: { id: order_id } })
      : null;

  // Fallback for local dev / any delay before the webhook lands: verify directly with
  // Stripe and fulfill immediately if it's actually paid. Not applicable to ramburs (COD)
  // orders — those are created already PAID, with no Stripe session at all.
  if (session_id && order && order.status !== "PAID") {
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    if (checkoutSession.payment_status === "paid") {
      order = await fulfillPaidOrder(session_id, checkoutSession.payment_intent as string | null);
    }
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <p className="text-slate-600">Comanda nu a fost găsită.</p>
      </div>
    );
  }

  const isCod = order.paymentMethod === "cod";

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      {order.status === "PAID" ? (
        <>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isCod ? "Comanda ta a fost plasată!" : "Mulțumim pentru comandă!"}
          </h1>
          <p className="mt-3 text-slate-600">
            {isCod
              ? `Comanda ta de ${formatRON(order.total)} va fi livrată prin ramburs. Vei primi un email de confirmare.`
              : `Am primit plata de ${formatRON(order.total)}. Vei primi un email de confirmare în scurt timp.`}
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-extrabold text-slate-900">Comanda se procesează…</h1>
          <p className="mt-3 text-slate-600">
            Reîmprospătează pagina în câteva secunde dacă plata nu apare confirmată.
          </p>
        </>
      )}
      <Link href="/" className="mt-8 inline-block font-medium text-brand hover:underline">
        Înapoi la pagina principală
      </Link>
    </div>
  );
}
