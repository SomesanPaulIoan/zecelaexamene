"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRON } from "@/lib/subjects";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none";
const labelClass = "block text-sm font-medium text-slate-700";

type Prefill = {
  firstName: string;
  lastName: string;
  email: string;
  county: string;
  city: string;
  street: string;
};

export function CoursePurchaseModal({
  courseId,
  subtotal,
  buttonClass,
  prefill,
  initialInvalidCode,
}: {
  courseId: string;
  subtotal: number;
  buttonClass: string;
  prefill: Prefill;
  initialInvalidCode?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(initialInvalidCode));
  const [discountCode, setDiscountCode] = useState("");
  const [pricing, setPricing] = useState({ discountValue: 0, total: subtotal });
  const [codeStatus, setCodeStatus] = useState<"idle" | "checking" | "valid" | "invalid">(
    initialInvalidCode ? "invalid" : "idle"
  );

  async function applyCode() {
    if (!discountCode.trim()) {
      setPricing({ discountValue: 0, total: subtotal });
      setCodeStatus("idle");
      return;
    }
    setCodeStatus("checking");
    try {
      const res = await fetch("/api/checkout/course/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, discountCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setPricing({ discountValue: 0, total: subtotal });
        setCodeStatus("invalid");
        return;
      }
      setPricing({ discountValue: data.discountValue, total: data.total });
      setCodeStatus("valid");
    } catch {
      setPricing({ discountValue: 0, total: subtotal });
      setCodeStatus("invalid");
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        Cumpără cursul
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Finalizează achiziția</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Închide"
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form action="/api/checkout/course" method="POST" className="mt-4 space-y-4">
              <input type="hidden" name="courseId" value={courseId} />
              <input type="hidden" name="discountCode" value={discountCode} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Nume</label>
                  <input name="billingLastName" required defaultValue={prefill.lastName} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Prenume</label>
                  <input name="billingFirstName" required defaultValue={prefill.firstName} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    name="billingEmail"
                    required
                    defaultValue={prefill.email}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Județ</label>
                  <input name="billingCounty" required defaultValue={prefill.county} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Localitate</label>
                  <input name="billingCity" required defaultValue={prefill.city} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Adresă (stradă și număr)</label>
                  <input name="billingAddress" required defaultValue={prefill.street} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Cod reducere (opțional)</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value);
                      setCodeStatus("idle");
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={applyCode}
                    disabled={codeStatus === "checking"}
                    className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {codeStatus === "checking" ? "..." : "Aplică"}
                  </button>
                </div>
                {codeStatus === "invalid" && (
                  <p className="mt-1 text-xs text-rose-600">Cod de reducere invalid.</p>
                )}
                {codeStatus === "valid" && (
                  <p className="mt-1 text-xs text-emerald-600">Cod aplicat.</p>
                )}
              </div>

              <div className="space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900">{formatRON(subtotal)}</span>
                </div>
                {pricing.discountValue > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Reducere</span>
                    <span>-{formatRON(pricing.discountValue)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatRON(pricing.total)}</span>
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" name="digitalContentConsent" required className="mt-1" />
                <span>
                  Accept{" "}
                  <Link href="/termeni-si-conditii" target="_blank" className="text-brand hover:underline">
                    termenii și condițiile
                  </Link>
                  .
                </span>
              </label>

              <button type="submit" className={buttonClass}>
                Plătește {formatRON(pricing.total)}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
