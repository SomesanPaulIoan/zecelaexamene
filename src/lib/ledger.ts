import "server-only";
import { prisma } from "@/lib/prisma";

export async function getBeneficiarySummary(beneficiaryId: string) {
  const beneficiary = await prisma.beneficiary.findUniqueOrThrow({ where: { id: beneficiaryId } });
  const sinceReset = beneficiary.ledgerResetAt ? { createdAt: { gt: beneficiary.ledgerResetAt } } : {};

  const [totals, paid, entries, payments] = await Promise.all([
    prisma.ledgerEntry.aggregate({
      where: { beneficiaryId, ...sinceReset },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.beneficiaryPayment.aggregate({
      where: { beneficiaryId },
      _sum: { amount: true },
    }),
    prisma.ledgerEntry.findMany({
      where: { beneficiaryId, ...sinceReset },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        order: { select: { paidAt: true, createdAt: true, type: true } },
        rule: { select: { note: true, type: true, value: true } },
      },
    }),
    prisma.beneficiaryPayment.findMany({
      where: { beneficiaryId },
      orderBy: { paidAt: "desc" },
    }),
  ]);

  const earnedRON = totals._sum.amount ? Number(totals._sum.amount) : 0;
  const paidRON = paid._sum.amount ? Number(paid._sum.amount) : 0;

  return {
    totalRON: earnedRON,
    paidRON,
    balanceRON: earnedRON - paidRON,
    entryCount: totals._count,
    entries,
    payments,
  };
}

export async function getAllBeneficiarySummaries() {
  const beneficiaries = await prisma.beneficiary.findMany({
    where: { legacyTeamId: { not: null } },
    orderBy: { legacyTeamId: "asc" },
  });

  return Promise.all(
    beneficiaries.map(async (b) => {
      const sinceReset = b.ledgerResetAt ? { createdAt: { gt: b.ledgerResetAt } } : {};
      const [earned, paid] = await Promise.all([
        prisma.ledgerEntry.aggregate({
          where: { beneficiaryId: b.id, ...sinceReset },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.beneficiaryPayment.aggregate({
          where: { beneficiaryId: b.id },
          _sum: { amount: true },
        }),
      ]);
      const earnedRON = Number(earned._sum.amount ?? 0);
      const paidRON = Number(paid._sum.amount ?? 0);
      return {
        beneficiary: b,
        totalRON: earnedRON,
        paidRON,
        balanceRON: earnedRON - paidRON,
        entryCount: earned._count,
      };
    })
  );
}

export async function recordBeneficiaryPayment(
  beneficiaryId: string,
  amount: number,
  note: string | null,
  createdByName: string | null,
  paidAt: Date
) {
  await prisma.beneficiaryPayment.create({
    data: { beneficiaryId, amount, note, createdByName, paidAt },
  });
}
