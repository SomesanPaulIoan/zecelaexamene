"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatRON } from "@/lib/subjects";
import { orderTotal, type PaymentMethod, type ShippingMethod } from "@/lib/shipping";
import { SamedayLockerPicker, type LockerSelection } from "@/components/checkout/SamedayLockerPicker";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none";
const labelClass = "block text-sm font-medium text-slate-700";

export function CheckoutForm({ subtotal, discountValue }: { subtotal: number; discountValue: number }) {
  const [billingType, setBillingType] = useState<"pf" | "company">("pf");
  const [shipMethod, setShipMethod] = useState<ShippingMethod>("sameday_easybox");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [locker, setLocker] = useState<LockerSelection | null>(null);

  const totals = useMemo(
    () => orderTotal({ subtotal, discountValue, method: shipMethod, paymentMethod }),
    [subtotal, discountValue, shipMethod, paymentMethod]
  );

  return (
    <form action="/api/checkout/books" method="POST" className="mt-8 space-y-8">
      {/* ---------- Facturare ---------- */}
      <section>
        <h2 className="text-lg font-bold text-slate-900">Detalii facturare</h2>
        <div className="mt-3 flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="billingType"
              value="pf"
              checked={billingType === "pf"}
              onChange={() => setBillingType("pf")}
            />
            Persoană fizică
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="billingType"
              value="company"
              checked={billingType === "company"}
              onChange={() => setBillingType("company")}
            />
            Firmă
          </label>
        </div>

        {billingType === "pf" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nume</label>
              <input name="pfLastName" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Prenume</label>
              <input name="pfFirstName" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="pfEmail" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefon</label>
              <input type="tel" name="pfPhone" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Județ</label>
              <input name="pfCounty" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Localitate</label>
              <input name="pfCity" required className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Adresă facturare (stradă și număr)</label>
              <input name="pfAddress" required className={inputClass} />
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Denumire firmă</label>
              <input name="coName" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>CUI</label>
              <input name="coCui" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nr. Reg. Com. (opțional)</label>
              <input name="coRegCom" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="coEmail" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefon</label>
              <input type="tel" name="coPhone" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Județ</label>
              <input name="coCounty" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Localitate</label>
              <input name="coCity" required className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Adresă sediu (stradă și număr)</label>
              <input name="coAddress" required className={inputClass} />
            </div>
            <p className="text-xs text-slate-500 sm:col-span-2">Factura se va emite pe firmă.</p>
          </div>
        )}
      </section>

      {/* ---------- Livrare ---------- */}
      <section>
        <h2 className="text-lg font-bold text-slate-900">Livrare</h2>
        <div className="mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="shipMethod"
              value="sameday_easybox"
              checked={shipMethod === "sameday_easybox"}
              onChange={() => setShipMethod("sameday_easybox")}
            />
            Ridicare din easyBox Sameday
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="shipMethod"
              value="courier"
              checked={shipMethod === "courier"}
              onChange={() => setShipMethod("courier")}
            />
            Curier la adresă
          </label>
        </div>

        {shipMethod === "sameday_easybox" ? (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Nume destinatar</label>
                <input name="ezName" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Telefon destinatar</label>
                <input type="tel" name="ezPhone" required className={inputClass} />
              </div>
            </div>
            <SamedayLockerPicker selected={locker} onSelect={setLocker} accentText="text-brand" />
            <input type="hidden" name="lockerId" value={locker?.lockerId ?? ""} />
            <input type="hidden" name="lockerName" value={locker?.name ?? ""} />
            <input type="hidden" name="lockerAddress" value={locker?.address ?? ""} />
            <input type="hidden" name="lockerCity" value={locker?.city ?? ""} />
            <input type="hidden" name="lockerCounty" value={locker?.county ?? ""} />
            <input type="hidden" name="lockerPostal" value={locker?.postalCode ?? ""} />
            <input type="hidden" name="lockerOohType" value={locker?.oohType ?? ""} />
            <input type="hidden" name="lockerLat" value={locker?.lat ?? ""} />
            <input type="hidden" name="lockerLng" value={locker?.lng ?? ""} />
            <p className="text-xs text-slate-500">
              Ridicare 24/7. Vei primi SMS de la Sameday când ajunge coletul.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nume destinatar</label>
              <input name="shipName" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefon destinatar</label>
              <input type="tel" name="shipPhone" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Județ</label>
              <input name="shipCounty" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Localitate</label>
              <input name="shipCity" required className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Adresă (stradă și număr)</label>
              <input name="shipAddress1" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Detalii adresă (opțional)</label>
              <input name="shipAddress2" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cod poștal (opțional)</label>
              <input name="shipPostal" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Observații curier (opțional)</label>
              <textarea name="shipNotes" rows={2} className={inputClass} />
            </div>
          </div>
        )}
      </section>

      {/* ---------- Plată ---------- */}
      <section>
        <h2 className="text-lg font-bold text-slate-900">Plată</h2>
        <div className="mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
            />
            Card online (Stripe)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            Ramburs la livrare (+{formatRON(4.99)})
          </label>
        </div>
        {paymentMethod === "cod" && (
          <p className="mt-2 text-xs text-slate-500">
            Plata se face la ridicare: la locker (card) sau către curier (numerar/card).
          </p>
        )}
      </section>

      {/* ---------- Totals ---------- */}
      <div className="space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Subtotal</span>
          <span className="text-slate-900">{formatRON(subtotal)}</span>
        </div>
        {discountValue > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Reducere</span>
            <span>-{formatRON(discountValue)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-600">Transport</span>
          <span className="text-slate-900">{totals.shipping === 0 ? "Gratuit" : formatRON(totals.shipping)}</span>
        </div>
        {totals.cod > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">Taxă ramburs</span>
            <span className="text-slate-900">{formatRON(totals.cod)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{formatRON(totals.total)}</span>
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" required className="mt-1" />
        <span>
          Sunt de acord cu{" "}
          <Link href="/termeni-si-conditii" target="_blank" className="text-brand hover:underline">
            termenii și condițiile
          </Link>{" "}
          și cu{" "}
          <Link href="/politica-confidentialitate" target="_blank" className="text-brand hover:underline">
            politica de confidențialitate
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        className="w-full rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        {paymentMethod === "cod" ? "Plasează comanda" : `Plătește ${formatRON(totals.total)}`}
      </button>
    </form>
  );
}
