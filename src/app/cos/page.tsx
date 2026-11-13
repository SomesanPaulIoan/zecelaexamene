import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveDiscountCode, applyDiscount } from "@/lib/discount";
import { formatRON } from "@/lib/subjects";

export const metadata: Metadata = { title: "Coșul meu" };

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ invalid?: string }>;
}) {
  const { invalid } = await searchParams;
  const session = await getSession();
  const cartItems = session.cart ?? [];

  const books = await prisma.book.findMany({ where: { id: { in: cartItems.map((i) => i.bookId) } } });
  const lines = cartItems
    .map((item) => {
      const book = books.find((b) => b.id === item.bookId);
      if (!book) return null;
      return { book, qty: item.qty, lineTotal: Number(book.price) * item.qty };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const discount = await resolveDiscountCode(session.discountCode, "BOOK");
  const { discountValue, total } = applyDiscount(subtotal, discount ? Number(discount.percent) : null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900">
        Coșul meu{" "}
        {lines.length > 0 && (
          <span className="text-lg font-medium text-slate-400">
            ({lines.reduce((sum, l) => sum + l.qty, 0)} {lines.reduce((sum, l) => sum + l.qty, 0) === 1 ? "produs" : "produse"})
          </span>
        )}
      </h1>

      {lines.length === 0 ? (
        <p className="mt-6 text-slate-500">
          Coșul e gol.{" "}
          <Link href="/carti" className="font-medium text-brand hover:underline">
            Vezi cărțile
          </Link>
        </p>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200">
            {lines.map(({ book, qty, lineTotal }) => (
              <li key={book.id} className="flex items-center gap-4 px-4 py-4">
                <div className="h-16 w-12 flex-none overflow-hidden rounded-md bg-slate-100">
                  {book.coverImageUrl && (
                    <Image
                      src={book.coverImageUrl}
                      alt={book.title}
                      width={96}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{book.title}</p>
                  <p className="text-sm text-slate-500">{formatRON(book.price)} / buc.</p>

                  <div className="mt-2 flex items-center gap-2">
                    <form action="/api/cart/update" method="POST">
                      <input type="hidden" name="bookId" value={book.id} />
                      <input type="hidden" name="qty" value={Math.max(1, qty - 1)} />
                      <button
                        type="submit"
                        disabled={qty <= 1}
                        aria-label="Scade cantitatea"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:border-brand hover:text-brand disabled:opacity-40"
                      >
                        −
                      </button>
                    </form>
                    <span className="w-6 text-center text-sm font-medium text-slate-900">{qty}</span>
                    <form action="/api/cart/update" method="POST">
                      <input type="hidden" name="bookId" value={book.id} />
                      <input type="hidden" name="qty" value={qty + 1} />
                      <button
                        type="submit"
                        aria-label="Crește cantitatea"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:border-brand hover:text-brand"
                      >
                        +
                      </button>
                    </form>

                    <form action="/api/cart/remove" method="POST" className="ml-2">
                      <input type="hidden" name="bookId" value={book.id} />
                      <button type="submit" className="text-sm text-slate-400 hover:text-rose-600">
                        Șterge
                      </button>
                    </form>
                  </div>
                </div>

                <p className="flex-none font-semibold text-slate-900">{formatRON(lineTotal)}</p>
              </li>
            ))}
          </ul>

          <form action="/api/cart/discount" method="POST" className="mt-6 flex gap-2">
            <input
              name="code"
              placeholder="Cod reducere"
              defaultValue={discount?.code ?? ""}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none"
            />
            <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:border-brand">
              Aplică
            </button>
          </form>
          {invalid && <p className="mt-2 text-sm text-rose-600">Cod de reducere invalid.</p>}

          <div className="mt-6 space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="text-slate-900">{formatRON(subtotal)}</span>
            </div>
            {discountValue > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Reducere ({discount?.percent.toString()}%)</span>
                <span>-{formatRON(discountValue)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatRON(total)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Finalizează comanda
          </Link>
        </>
      )}
    </div>
  );
}
