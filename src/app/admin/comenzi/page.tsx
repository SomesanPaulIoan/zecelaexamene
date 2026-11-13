import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRON } from "@/lib/subjects";
import { retryInvoiceAction, markShippedAction } from "./actions";

const TABS = [
  { key: "netrimise", label: "Netrimise" },
  { key: "trimise", label: "Trimise" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function destinationLabel(o: { shippingMethod: string | null; lockerName: string | null; shippingAddress: string | null; shippingCity: string | null; shippingCounty: string | null }) {
  if (!o.shippingMethod) return "—"; // course order, no shipping
  if (o.shippingMethod === "sameday_easybox") return `easyBox: ${o.lockerName ?? "—"}`;
  return [o.shippingAddress, o.shippingCity, o.shippingCounty].filter(Boolean).join(", ") || "—";
}

function itemsPreview(items: { title: string; qty: number }[]) {
  if (items.length === 0) return "—";
  const first = items[0];
  const label = `${first.title || "Produs"}${first.qty > 1 ? ` ×${first.qty}` : ""}`;
  return items.length > 1 ? `${label} +${items.length - 1}` : label;
}

function statusBadge(o: { status: string; type: string; paymentMethod: string; total: Parameters<typeof formatRON>[0] }) {
  if (o.status === "PENDING") {
    return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Neplătit</span>;
  }
  if (o.status !== "PAID") {
    return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">{o.status}</span>;
  }
  if (o.type === "BOOK" && o.paymentMethod === "cod") {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
        Ramburs — de încasat {formatRON(o.total)}
      </span>
    );
  }
  return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Plătit</span>;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPERADMIN") redirect("/admin");

  const { tab: tabParam } = await searchParams;
  const tab: TabKey = tabParam === "trimise" ? "trimise" : "netrimise";

  // Book orders only, split by whether they've been sent. Unpaid (PENDING) orders are abandoned
  // Stripe checkouts, not real orders, so they're excluded; COD orders are PAID at checkout.
  const where =
    tab === "trimise"
      ? { status: "PAID" as const, type: "BOOK" as const, shippedAt: { not: null } }
      : { status: "PAID" as const, type: "BOOK" as const, shippedAt: null };

  const orders = await prisma.order.findMany({
    where,
    orderBy: tab === "trimise" ? { shippedAt: "desc" } : { paidAt: "desc" },
    take: 100,
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      invoice: { select: { series: true, number: true } },
      items: { select: { title: true, qty: true } },
    },
  });

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-full bg-slate-100 p-1 text-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/comenzi?tab=${t.key}`}
            className={`whitespace-nowrap rounded-full px-4 py-2 font-medium transition ${
              tab === t.key ? "bg-brand text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Dată</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Tip</th>
              <th className="px-4 py-3 font-medium">Produse</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Livrare</th>
              <th className="px-4 py-3 font-medium">Factură</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 text-slate-600">
                  {(o.paidAt ?? o.createdAt).toLocaleDateString("ro-RO")}
                </td>
                <td className="px-4 py-3 text-slate-900">
                  <Link href={`/admin/comenzi/${o.id}`} className="hover:text-brand hover:underline">
                    {o.user ? `${o.user.firstName} ${o.user.lastName}` : o.billingName || "Client fără cont"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{o.type === "COURSE" ? "Curs" : "Carte"}</td>
                <td className="px-4 py-3 text-slate-600">{itemsPreview(o.items)}</td>
                <td className="px-4 py-3">{statusBadge(o)}</td>
                <td className="px-4 py-3 text-slate-600">{destinationLabel(o)}</td>
                <td className="px-4 py-3">
                  {o.invoice ? (
                    <span className="text-emerald-700">
                      {o.invoice.series}-{o.invoice.number}
                    </span>
                  ) : o.status === "PAID" ? (
                    <form action={retryInvoiceAction}>
                      <input type="hidden" name="orderId" value={o.id} />
                      <button className="text-rose-600 hover:underline">Generează factura</button>
                    </form>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">{formatRON(o.total)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {o.type === "BOOK" &&
                      o.status === "PAID" &&
                      (o.shippedAt ? (
                        <span className="text-xs text-emerald-700">Trimisă {o.shippedAt.toLocaleDateString("ro-RO")}</span>
                      ) : (
                        <form action={markShippedAction}>
                          <input type="hidden" name="orderId" value={o.id} />
                          <button className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-brand hover:text-brand">
                            Marchează trimisă
                          </button>
                        </form>
                      ))}
                    <Link href={`/admin/comenzi/${o.id}`} className="font-medium text-brand hover:underline">
                      Vezi
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                  Nicio comandă în această categorie.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
