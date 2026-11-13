// Mirrors the legacy site's shipping/COD pricing exactly (carti/actions/save_checkout.php).
// Pure functions so the checkout form can show live totals client-side while the server
// route still recomputes everything itself as the source of truth.

export const COD_FEE = 4.99;
const FREE_SHIPPING_THRESHOLD = 200;
const EASYBOX_BASE = 17.99;
const COURIER_BASE = 24.99;
const COURIER_ABOVE_THRESHOLD = 9.99;

export type ShippingMethod = "sameday_easybox" | "courier";
export type PaymentMethod = "card" | "cod";

// Shipping cost is based on the product subtotal (before discount), same as legacy.
export function shippingCost(subtotal: number, method: ShippingMethod): number {
  if (subtotal <= 0) return 0;
  if (method === "sameday_easybox") return subtotal < FREE_SHIPPING_THRESHOLD ? EASYBOX_BASE : 0;
  return subtotal < FREE_SHIPPING_THRESHOLD ? COURIER_BASE : COURIER_ABOVE_THRESHOLD;
}

export function codFee(paymentMethod: PaymentMethod): number {
  return paymentMethod === "cod" ? COD_FEE : 0;
}

export function orderTotal(opts: {
  subtotal: number;
  discountValue: number;
  method: ShippingMethod;
  paymentMethod: PaymentMethod;
}): { shipping: number; cod: number; total: number } {
  const shipping = shippingCost(opts.subtotal, opts.method);
  const cod = codFee(opts.paymentMethod);
  const base = Math.max(0, opts.subtotal - opts.discountValue);
  return { shipping, cod, total: base + shipping + cod };
}

// Public config for the Sameday Locker Plugin SDK — not a secret, meant to be embedded
// client-side (same as the legacy site's carti/checkout.php).
export const SAMEDAY_LOCKER_CONFIG = {
  clientId: "8b8c0a1e-47a2-4a9b-9e57-8fcdcf645cf8",
  apiUsername: "zecelaexameneAPI",
};
