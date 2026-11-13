import "server-only";
import { prisma } from "@/lib/prisma";
import { createSmartBillInvoice, downloadSmartBillInvoicePdf, isSmartBillConfigured } from "@/lib/smartbill";

/**
 * Generates a SmartBill invoice (Romanian SRL, CIF from env, 0% VAT — the company is not
 * a VAT payer) for a paid Order, downloads the PDF, and stores both on an Invoice row.
 *
 * Deliberately does NOT throw on failure — a SmartBill outage must never block order
 * fulfillment (the customer has already paid; access/ledger already happened). Failures are
 * logged and left for an admin to retry via generateInvoiceForOrder called again later,
 * mirroring the legacy site's `admin/facturi_pendings.php` recovery tool.
 */
export async function generateInvoiceForOrder(orderId: string): Promise<void> {
  const existing = await prisma.invoice.findUnique({ where: { orderId } });
  if (existing) return; // already invoiced — idempotent

  if (!isSmartBillConfigured()) {
    console.warn(`[invoicing] SmartBill not configured — skipping invoice for order ${orderId}`);
    return;
  }

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });

  try {
    const issueDate = new Date().toISOString().slice(0, 10);
    const result = await createSmartBillInvoice({
      client: {
        name: order.billingName || order.billingCompany || "Client",
        email: order.billingEmail,
        address: order.billingAddress ?? order.shippingAddress ?? undefined,
        city: order.billingCity ?? order.shippingCity ?? undefined,
        county: order.billingCounty ?? order.shippingCounty ?? undefined,
      },
      products: order.items.map((item) => ({
        name: item.title,
        quantity: item.qty,
        price: Number(item.lineTotal) / item.qty,
      })),
      issueDate,
      mentions: `Comandă: ${order.id}`,
    });

    const pdfData = await downloadSmartBillInvoicePdf(result.series, result.number);
    if (!pdfData) {
      console.error(
        `[invoicing] Invoice ${result.series}-${result.number} created for order ${orderId} but PDF download failed.`
      );
    }

    await prisma.invoice.create({
      data: {
        orderId: order.id,
        series: result.series,
        number: Number(result.number),
        year: new Date().getFullYear(),
        total: order.total,
        vatRate: 0,
        vatTotal: 0,
        smartbillId: `${result.series}-${result.number}`,
        issueDate: new Date(),
        pdfData: pdfData ? new Uint8Array(pdfData) : null,
      },
    });
  } catch (err) {
    console.error(`[invoicing] Failed to generate SmartBill invoice for order ${orderId}:`, err);
  }
}
