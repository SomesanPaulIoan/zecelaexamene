import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Evaluates RevenueShareRule against a just-paid Order and records LedgerEntry rows.
 * Mirrors the logic used by the one-time legacy-data backfill (scripts/migrate/run.ts) —
 * keep the two in sync if the rule model changes.
 *
 * Idempotent: safe to call more than once for the same order (e.g. a retried webhook).
 */
export async function recordLedgerForOrder(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { include: { course: true, book: true } } },
  });

  for (const item of order.items) {
    if (item.courseId && item.course) {
      const rule = await prisma.revenueShareRule.findFirst({
        where: { scope: "SUBJECT", subject: item.course.subject, active: true },
      });
      if (!rule) continue;
      const already = await prisma.ledgerEntry.findFirst({ where: { orderItemId: item.id, ruleId: rule.id } });
      if (already) continue;
      const amount =
        rule.type === "PERCENT" ? (Number(item.lineTotal) * Number(rule.value)) / 100 : Number(rule.value);
      await prisma.ledgerEntry.create({
        data: {
          beneficiaryId: rule.beneficiaryId,
          ruleId: rule.id,
          orderId: order.id,
          orderItemId: item.id,
          amount,
          source: "LIVE",
        },
      });
    }

    if (item.bookId && item.book) {
      const rule = await prisma.revenueShareRule.findFirst({
        where: { scope: "BOOK", bookId: item.bookId, active: true },
      });
      if (!rule) continue;
      const already = await prisma.ledgerEntry.findFirst({ where: { orderItemId: item.id, ruleId: rule.id } });
      if (already) continue;
      const amount =
        rule.type === "FIXED" ? Number(rule.value) * item.qty : (Number(item.lineTotal) * Number(rule.value)) / 100;
      await prisma.ledgerEntry.create({
        data: {
          beneficiaryId: rule.beneficiaryId,
          ruleId: rule.id,
          orderId: order.id,
          orderItemId: item.id,
          amount,
          source: "LIVE",
        },
      });
    }
  }
}
