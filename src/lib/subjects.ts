export const SUBJECT_LABELS: Record<string, string> = {
  INFORMATICA: "Informatică",
  MATEMATICA: "Matematică",
  ROMANA: "Limba Română",
  ISTORIE: "Istorie",
  BIOLOGIE: "Biologie",
  FIZICA: "Fizică",
};

export const SUBJECT_COLORS: Record<string, string> = {
  INFORMATICA: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  MATEMATICA: "bg-amber-50 text-amber-700 ring-amber-600/20",
  ROMANA: "bg-rose-50 text-rose-700 ring-rose-600/20",
  ISTORIE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  BIOLOGIE: "bg-teal-50 text-teal-700 ring-teal-600/20",
  FIZICA: "bg-blue-50 text-blue-700 ring-blue-600/20",
};

export function formatRON(amount: number | string | { toString(): string }) {
  const n = Number(amount.toString());
  // Whole amounts stay clean ("400 lei"); fractional ones (almost always from a .99
  // shipping/COD fee) show their real cents so the total always matches what Stripe
  // actually charges — rounding this away made a real 124.99 total display as "125 lei".
  return new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n) + " lei";
}
