import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveDiscountCode, applyDiscount } from "@/lib/discount";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Finalizează comanda" };

export default async function CheckoutPage() {
  const session = await getSession();
  const cartItems = session.cart ?? [];
  if (cartItems.length === 0) redirect("/cos");

  const books = await prisma.book.findMany({ where: { id: { in: cartItems.map((i) => i.bookId) } } });
  const subtotal = cartItems.reduce((sum, item) => {
    const book = books.find((b) => b.id === item.bookId);
    return sum + (book ? Number(book.price) * item.qty : 0);
  }, 0);
  const discount = await resolveDiscountCode(session.discountCode, "BOOK");
  const { discountValue } = applyDiscount(subtotal, discount ? Number(discount.percent) : null);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Finalizează comanda</h1>
      <CheckoutForm subtotal={subtotal} discountValue={discountValue} />
    </div>
  );
}
