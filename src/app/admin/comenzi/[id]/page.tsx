import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRON } from "@/lib/subjects";
import { retryInvoiceAction, markShippedAction } from "../actions";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Neplătită",
  PAID: "Plătită",
  CANCELED: "Anulată",
  FAILED: "Eșuată",
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.role !== "SUPERADMIN") redirect("/admin");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      items: true,
      invoice: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  const isEasyBox = order.shippingMethod === "sameday_easybox";
  const isCod = order.type === "BOOK" && order.paymentMethod === "cod";

  return (
    <div>
      <Link href="/admin/comenzi" className="text-sm text-slate-500 hover:text-brand">
        ← Toate comenzile
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Comanda {(order.paidAt ?? order.createdAt).toLocaleDateString("ro-RO")}
          </h2>
          <p className="text-sm text-slate-500">
            {order.user ? `${order.user.firstName} ${order.user.lastName} (${order.user.email})` : "Client fără cont"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              order.status === "PAID"
                ? "bg-emerald-100 text-emerald-700"
                : order.status === "PENDING"
                  ? "bg-slate-100 text-slate-600"
                  : "bg-rose-100 text-rose-700"
            }`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          {isCod && order.status === "PAID" && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Ramburs — de încasat {formatRON(order.total)}
            </span>
          )}
        </div>
      </div>

      {/* ---------- Products ---------- */}
      <h3 className="mt-8 text-base font-semibold text-slate-900">Produse</h3>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Titlu</th>
              <th className="px-4 py-2 font-medium text-right">Cant.</th>
              <th className="px-4 py-2 font-medium text-right">Preț unitar</th>
              <th className="px-4 py-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {order.items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-2 text-slate-900">{it.title || "Produs"}</td>
                <td className="px-4 py-2 text-right text-slate-600">{it.qty}</td>
                <td className="px-4 py-2 text-right text-slate-600">{formatRON(it.unitPrice)}</td>
                <td className="px-4 py-2 text-right font-medium text-slate-900">{formatRON(it.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatRON(order.subtotal)}</span>
          </div>
          {Number(order.discountValue) > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Discount</span>
              <span>-{formatRON(order.discountValue)}</span>
            </div>
          )}
          {Number(order.shippingCost) > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Transport</span>
              <span>{formatRON(order.shippingCost)}</span>
            </div>
          )}
          {Number(order.codFee) > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Taxă ramburs</span>
              <span>{formatRON(order.codFee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatRON(order.total)}</span>
          </div>
        </div>
      </div>

      {/* ---------- Shipping ---------- */}
      {order.type === "BOOK" && (
        <>
          <h3 className="mt-8 text-base font-semibold text-slate-900">Livrare</h3>
          <div className="mt-3 rounded-xl border border-slate-200 p-4 text-sm">
            <p className="font-medium text-slate-900">
              {order.shippingRecipientName || "—"}
              {order.shippingRecipientPhone && (
                <span className="ml-2 font-normal text-slate-500">{order.shippingRecipientPhone}</span>
              )}
            </p>
            <p className="mt-1 text-slate-500">
              {order.shippingMethod === "sameday_easybox" ? "Livrare easyBox Sameday" : "Livrare prin curier"}
              {order.paymentMethod === "cod" ? " · Plată ramburs" : " · Plătit cu cardul"}
            </p>

            {isEasyBox ? (
              <div className="mt-3 space-y-1 text-slate-700">
                <p className="font-medium">{order.lockerName || "—"}</p>
                <p>
                  {[order.lockerAddress, order.lockerCity, order.lockerCounty, order.lockerPostal]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
                {order.lockerOohType && <p className="text-slate-500">Tip: {order.lockerOohType}</p>}
                {order.lockerId && <p className="text-slate-400">ID locker: {order.lockerId}</p>}
              </div>
            ) : (
              <div className="mt-3 space-y-1 text-slate-700">
                <p>{order.shippingAddress || "—"}</p>
                <p>
                  {[order.shippingCity, order.shippingCounty, order.shippingPostal].filter(Boolean).join(", ") ||
                    "—"}
                </p>
              </div>
            )}
            {order.shippingNotes && (
              <p className="mt-3 text-slate-500">
                <span className="font-medium text-slate-700">Note: </span>
                {order.shippingNotes}
              </p>
            )}

            <div className="mt-4 flex items-center gap-3 border-t border-slate-200 pt-3">
              {order.shippedAt ? (
                <span className="text-sm text-emerald-700">
                  Trimisă la {order.shippedAt.toLocaleDateString("ro-RO")}
                </span>
              ) : order.status === "PAID" ? (
                <form action={markShippedAction}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <button className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110">
                    Marchează trimisă
                  </button>
                </form>
              ) : (
                <span className="text-sm text-slate-400">Comanda nu este plătită încă.</span>
              )}
            </div>
          </div>
        </>
      )}

      {/* ---------- Billing ---------- */}
      <h3 className="mt-8 text-base font-semibold text-slate-900">Facturare</h3>
      <div className="mt-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-900">
          {order.billingType === "company" ? order.billingCompany : order.billingName}
        </p>
        {order.billingType === "company" && (
          <p className="text-slate-500">
            CUI {order.billingCui || "—"}
            {order.billingRegCom ? ` · Reg. Com. ${order.billingRegCom}` : ""}
          </p>
        )}
        <p className="mt-1 text-slate-500">
          {order.billingEmail}
          {order.billingPhone ? ` · ${order.billingPhone}` : ""}
        </p>
        {order.billingAddress && <p className="text-slate-500">{order.billingAddress}</p>}

        <div className="mt-3 flex items-center gap-3 border-t border-slate-200 pt-3">
          {order.invoice ? (
            order.invoice.pdfData ? (
              <a
                href={`/api/facturi/${order.invoice.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand hover:underline"
              >
                Vezi factura {order.invoice.series}-{order.invoice.number}
              </a>
            ) : (
              <span className="text-slate-500">
                Factură {order.invoice.series}-{order.invoice.number} (fără PDF)
              </span>
            )
          ) : order.status === "PAID" ? (
            <form action={retryInvoiceAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <button className="text-rose-600 hover:underline">Generează factura</button>
            </form>
          ) : (
            <span className="text-slate-400">Fără factură — comanda nu este plătită.</span>
          )}
        </div>
      </div>
    </div>
  );
}
