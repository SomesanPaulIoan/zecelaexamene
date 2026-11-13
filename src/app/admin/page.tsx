import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllBeneficiarySummaries, getBeneficiarySummary } from "@/lib/ledger";
import { formatRON } from "@/lib/subjects";
import { BeneficiaryAccordion, type LedgerEntryRow, type PaymentRow } from "@/components/admin/BeneficiaryAccordion";

function toEntryRows(entries: Awaited<ReturnType<typeof getBeneficiarySummary>>["entries"]): LedgerEntryRow[] {
  return entries.map((e) => ({
    id: e.id,
    date: e.order.paidAt ?? e.order.createdAt,
    type: e.order.type,
    note: e.rule?.note ?? null,
    amount: Number(e.amount),
  }));
}

function toPaymentRows(payments: Awaited<ReturnType<typeof getBeneficiarySummary>>["payments"]): PaymentRow[] {
  return payments.map((p) => ({
    id: p.id,
    date: p.paidAt,
    note: p.note,
    createdByName: p.createdByName,
    amount: Number(p.amount),
  }));
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const todayISO = new Date().toISOString().slice(0, 10);

  if (user.role === "SUPERADMIN") {
    const summaries = await getAllBeneficiarySummaries();
    const grandBalance = summaries.reduce((sum, s) => sum + s.balanceRON, 0);

    const details = await Promise.all(
      summaries.map((s) => getBeneficiarySummary(s.beneficiary.id))
    );

    return (
      <div>
        <p className="text-sm text-slate-500">Datorie curentă totală către colaboratori</p>
        <p className="text-3xl font-bold text-slate-900">{formatRON(grandBalance)}</p>

        <div className="mt-8 space-y-3">
          {summaries.map((s, i) => (
            <BeneficiaryAccordion
              key={s.beneficiary.id}
              beneficiaryId={s.beneficiary.id}
              name={s.beneficiary.name}
              totalRON={s.totalRON}
              paidRON={s.paidRON}
              balanceRON={s.balanceRON}
              entryCount={s.entryCount}
              entries={toEntryRows(details[i].entries)}
              payments={toPaymentRows(details[i].payments)}
              canRecordPayment
              todayISO={todayISO}
            />
          ))}
        </div>
      </div>
    );
  }

  // TEACHER_ADMIN: only their own scoped ledger + balance + payment history (read-only).
  if (!user.beneficiary) {
    return <p className="text-slate-500">Nu ai un cont de beneficiar asociat.</p>;
  }
  const summary = await getBeneficiarySummary(user.beneficiary.id);

  return (
    <div>
      <p className="text-sm text-slate-500">Datorie curentă către tine</p>
      <p className="text-3xl font-bold text-slate-900">{formatRON(summary.balanceRON)}</p>

      <div className="mt-8">
        <BeneficiaryAccordion
          beneficiaryId={user.beneficiary.id}
          name={user.beneficiary.name}
          totalRON={summary.totalRON}
          paidRON={summary.paidRON}
          balanceRON={summary.balanceRON}
          entryCount={summary.entryCount}
          entries={toEntryRows(summary.entries)}
          payments={toPaymentRows(summary.payments)}
          canRecordPayment={false}
          defaultOpen
        />
      </div>
    </div>
  );
}
