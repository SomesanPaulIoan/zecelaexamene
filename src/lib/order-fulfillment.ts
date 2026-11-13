import "server-only";
import { prisma } from "@/lib/prisma";
import { recordLedgerForOrder } from "@/lib/revenue-share";
import { generateInvoiceForOrder } from "@/lib/invoicing";
import { sendMail } from "@/lib/mail";
import { renderPurchaseConfirmationEmail } from "@/lib/emails/purchase-confirmation";
import { renderAuthorSaleEmail, type AuthorSaleItem } from "@/lib/emails/author-sale";

// New, consistent access-duration policy going forward: 1 year from purchase for every
// course, regardless of subject — replaces the legacy split (+370 days vs +12 months).
const COURSE_ACCESS_DAYS = 365;

/**
 * Marks a Stripe-paid Order paid and runs fulfillment. Called from the Stripe webhook
 * (source of truth) and, as a fallback, from the checkout success page in case the webhook
 * hasn't landed yet (e.g. local dev without `stripe listen`). Idempotent.
 */
export async function fulfillPaidOrder(stripeSessionId: string, paymentIntentId: string | null) {
  const order = await prisma.order.findUnique({ where: { stripeSessionId } });
  if (!order) return null;
  if (order.status === "PAID") return order;

  const paidAt = new Date();
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paidAt,
      stripePaymentIntentId: paymentIntentId ?? undefined,
      payments: {
        create: [
          {
            provider: "stripe",
            amount: order.total,
            currency: order.currency,
            status: "SUCCEEDED",
            externalId: paymentIntentId ?? undefined,
          },
        ],
      },
    },
  });

  return finalizeOrder(order.id, paidAt);
}

/**
 * COD (ramburs) orders never touch Stripe — they're created already `PAID` (matching the
 * legacy site's behavior: trust is placed on the courier/locker operator to collect payment
 * on delivery). This runs the same fulfillment steps as the Stripe path.
 */
export async function fulfillCodOrder(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  const paidAt = new Date();
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paidAt,
      payments: {
        create: [
          {
            provider: "cod",
            amount: order.total,
            currency: order.currency,
            status: "SUCCEEDED",
          },
        ],
      },
    },
  });
  return finalizeOrder(order.id, paidAt);
}

async function finalizeOrder(orderId: string, paidAt: Date) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });

  if (order.type === "COURSE" && order.userId) {
    const expiresAt = new Date(paidAt);
    expiresAt.setDate(expiresAt.getDate() + COURSE_ACCESS_DAYS);
    for (const item of order.items) {
      if (!item.courseId) continue;
      await prisma.courseAccess.upsert({
        where: { userId_courseId: { userId: order.userId, courseId: item.courseId } },
        update: { expiresAt, source: "PURCHASE", orderId: order.id },
        create: {
          userId: order.userId,
          courseId: item.courseId,
          expiresAt,
          source: "PURCHASE",
          orderId: order.id,
        },
      });
    }
  }

  await recordLedgerForOrder(order.id);
  await sendAuthorSaleNotifications(order.id);
  await generateInvoiceForOrder(order.id);

  const invoice = await prisma.invoice.findUnique({ where: { orderId: order.id } });
  await sendPurchaseConfirmationEmail(
    order.id,
    invoice ? { series: invoice.series, number: invoice.number } : null,
    invoice?.pdfData ?? null
  );

  return prisma.order.findUnique({ where: { id: order.id } });
}

// One email per beneficiary who earned something on this order, summarizing just their own
// items — never exposes the buyer's name/email (matches the admin ledger UI, which is also
// buyer-blind). Never lets a mail failure affect fulfillment.
async function sendAuthorSaleNotifications(orderId: string) {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      where: { orderId },
      include: {
        beneficiary: { include: { user: true } },
        orderItem: { include: { course: true, book: true } },
      },
    });

    const byBeneficiary = new Map<string, typeof entries>();
    for (const entry of entries) {
      const list = byBeneficiary.get(entry.beneficiaryId) ?? [];
      list.push(entry);
      byBeneficiary.set(entry.beneficiaryId, list);
    }

    const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

    for (const group of byBeneficiary.values()) {
      const beneficiary = group[0].beneficiary;
      const email = beneficiary.user?.email ?? beneficiary.contactEmail;
      if (!email) {
        console.warn(`[mail] No email on file for beneficiary ${beneficiary.name} — skipping sale notification.`);
        continue;
      }

      const items: AuthorSaleItem[] = group.map((entry) => ({
        title: entry.orderItem?.course?.title ?? entry.orderItem?.book?.title ?? "Produs",
        amount: Number(entry.amount),
        type: entry.orderItem?.courseId ? "COURSE" : "BOOK",
      }));

      const authorFirstName = beneficiary.user?.firstName || beneficiary.name.split(/[\s-]+/)[0];
      const { subject, html, text } = renderAuthorSaleEmail({ authorFirstName, items, siteUrl });

      await sendMail({ to: email, subject, html, text });
    }
  } catch (err) {
    console.error(`[mail] Failed to send author sale notifications for order ${orderId}:`, err);
  }
}

// Never lets an email failure affect fulfillment — access/ledger/invoice already happened
// by the time this runs.
async function sendPurchaseConfirmationEmail(
  orderId: string,
  invoice: { series: string; number: number } | null,
  invoicePdf: Uint8Array | null
) {
  try {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: { include: { course: true } }, user: true },
    });
    const firstName = order.user?.firstName || order.billingName.split(" ")[0] || "acolo";
    const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

    const { subject, html, text } = renderPurchaseConfirmationEmail({
      firstName,
      orderType: order.type,
      items: order.items.map((i) => ({ title: i.title, lineTotal: Number(i.lineTotal) })),
      discountValue: Number(order.discountValue),
      shippingCost: Number(order.shippingCost),
      codFee: Number(order.codFee),
      total: Number(order.total),
      courseLinks:
        order.type === "COURSE"
          ? order.items
              .filter((i) => i.course)
              .map((i) => ({ title: i.course!.title, url: `${siteUrl}/cursuri/${i.course!.slug}` }))
          : [],
      shipping:
        order.type === "BOOK" && order.shippingAddress
          ? {
              address: order.shippingAddress,
              city: order.shippingCity ?? "",
              county: order.shippingCounty ?? "",
            }
          : null,
      invoice,
      siteUrl,
    });

    await sendMail({
      to: order.billingEmail,
      cc: process.env.OWNER_NOTIFY_EMAIL,
      subject,
      html,
      text,
      attachments:
        invoicePdf && invoice
          ? [
              {
                filename: `factura_${invoice.series}_${invoice.number}.pdf`,
                content: Buffer.from(invoicePdf),
                contentType: "application/pdf",
              },
            ]
          : undefined,
    });
  } catch (err) {
    console.error(`[mail] Failed to send purchase confirmation for order ${orderId}:`, err);
  }
}
