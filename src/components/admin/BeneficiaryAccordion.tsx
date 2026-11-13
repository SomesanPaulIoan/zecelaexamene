"use client";

import { useActionState, useState } from "react";
import { formatRON } from "@/lib/subjects";
import { recordBeneficiaryPaymentAction } from "@/app/admin/actions";

export type LedgerEntryRow = {
  id: string;
  date: Date;
  type: string;
  note: string | null;
  amount: number;
};

export type PaymentRow = {
  id: string;
  date: Date;
  note: string | null;
  createdByName: string | null;
  amount: number;
};

export function BeneficiaryAccordion({
  beneficiaryId,
  name,
  totalRON,
  paidRON,
  balanceRON,
  entryCount,
  entries,
  payments,
  canRecordPayment,
  defaultOpen = false,
  todayISO,
}: {
  beneficiaryId: string;
  name: string;
  totalRON: number;
  paidRON: number;
  balanceRON: number;
  entryCount: number;
  entries: LedgerEntryRow[];
  payments: PaymentRow[];
  canRecordPayment: boolean;
  defaultOpen?: boolean;
  todayISO?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [error, formAction, pending] = useActionState(recordBeneficiaryPaymentAction, null);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50"
      >
        <div>
          <p className="font-medium text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{entryCount} vânzări</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Datorie curentă</p>
            <p className={`font-semibold ${balanceRON < 0 ? "text-emerald-600" : "text-slate-900"}`}>
              {formatRON(balanceRON)}
            </p>
          </div>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-5 w-5 flex-none text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-200 px-4 py-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Total încasat</p>
              <p className="font-semibold text-slate-900">{formatRON(totalRON)}</p>
            </div>
            <div>
              <p className="text-slate-500">Total plătit</p>
              <p className="font-semibold text-slate-900">{formatRON(paidRON)}</p>
            </div>
            <div>
              <p className="text-slate-500">Sold curent</p>
              <p className={`font-semibold ${balanceRON < 0 ? "text-emerald-600" : "text-slate-900"}`}>
                {formatRON(balanceRON)}
              </p>
            </div>
          </div>

          {canRecordPayment && (
            <form
              action={formAction}
              className="mt-5 flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-3"
            >
              <input type="hidden" name="beneficiaryId" value={beneficiaryId} />
              <div>
                <label className="block text-xs font-medium text-slate-600">Sumă plătită (RON)</label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  required
                  className="mt-1 w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Data plății</label>
                <input
                  type="date"
                  name="paidAt"
                  defaultValue={todayISO}
                  className="mt-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-brand focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600">Notă (opțional)</label>
                <input
                  name="note"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-brand focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {pending ? "Se salvează…" : "Înregistrează plata"}
              </button>
              {error && <p className="w-full text-sm text-rose-600">{error}</p>}
            </form>
          )}

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Vânzări</p>
              <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100">
                    {entries.map((e) => (
                      <tr key={e.id}>
                        <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                          {e.date.toLocaleDateString("ro-RO")}
                        </td>
                        <td className="px-3 py-2 text-slate-500">{e.type === "COURSE" ? "Curs" : "Carte"}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-900">{formatRON(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {entries.length === 0 && <p className="p-3 text-xs text-slate-500">Nu există vânzări.</p>}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">Istoric plăți</p>
              <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                          {p.date.toLocaleDateString("ro-RO")}
                        </td>
                        <td className="px-3 py-2 text-slate-500">{p.note || p.createdByName || "—"}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-900">{formatRON(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payments.length === 0 && <p className="p-3 text-xs text-slate-500">Nu există plăți încă.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
