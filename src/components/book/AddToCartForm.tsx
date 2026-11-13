"use client";

import { useState } from "react";
import { formatRON } from "@/lib/subjects";

export function AddToCartForm({
  bookId,
  unitPrice,
  accentSolid,
}: {
  bookId: string;
  unitPrice: number;
  accentSolid: string;
}) {
  const [qty, setQty] = useState(1);

  return (
    <form action="/api/cart/add" method="POST" className="mt-5">
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="qty" value={qty} />

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-slate-300">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-lg text-slate-600 hover:text-slate-900"
            aria-label="Scade cantitatea"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold text-slate-900">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center text-lg text-slate-600 hover:text-slate-900"
            aria-label="Crește cantitatea"
          >
            +
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Total: <span className="font-semibold text-slate-900">{formatRON(unitPrice * qty)}</span>
        </p>
      </div>

      <button
        type="submit"
        className={`mt-4 w-full rounded-full ${accentSolid} px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110`}
      >
        Adaugă în coș
      </button>
    </form>
  );
}
