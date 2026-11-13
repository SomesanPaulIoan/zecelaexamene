import { formatRON } from "@/lib/subjects";

export type PurchaseEmailItem = { title: string; lineTotal: number };
export type PurchaseEmailCourseLink = { title: string; url: string };
export type PurchaseEmailShipping = { address: string; city: string; county: string } | null;
export type PurchaseEmailInvoice = { series: string; number: number } | null;

export type PurchaseEmailData = {
  firstName: string;
  orderType: "COURSE" | "BOOK";
  items: PurchaseEmailItem[];
  discountValue: number;
  shippingCost: number;
  codFee: number;
  total: number;
  courseLinks: PurchaseEmailCourseLink[];
  shipping: PurchaseEmailShipping;
  invoice: PurchaseEmailInvoice;
  siteUrl: string;
};

const BRAND = "#1d4ed8";
const BRAND_DARK = "#1e3a8a";

export function renderPurchaseConfirmationEmail(data: PurchaseEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject =
    data.orderType === "COURSE"
      ? `Acces confirmat: ${data.items[0]?.title ?? "cursul tău"}`
      : "Comanda ta a fost confirmată";

  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;color:#334155;font-size:15px;border-bottom:1px solid #e2e8f0;">${escapeHtml(item.title)}</td>
        <td style="padding:10px 0;color:#0f172a;font-size:15px;font-weight:600;text-align:right;white-space:nowrap;border-bottom:1px solid #e2e8f0;">${formatRON(item.lineTotal)}</td>
      </tr>`
    )
    .join("");

  const feeRow = (label: string, amountLabel: string) => `
      <tr>
        <td style="padding:6px 0;color:#64748b;font-size:14px;">${label}</td>
        <td style="padding:6px 0;color:#64748b;font-size:14px;text-align:right;white-space:nowrap;">${amountLabel}</td>
      </tr>`;
  const feeRowsHtml = [
    data.discountValue > 0 ? feeRow("Reducere", `-${formatRON(data.discountValue)}`) : "",
    data.shippingCost > 0 ? feeRow("Transport", formatRON(data.shippingCost)) : "",
    data.codFee > 0 ? feeRow("Taxă ramburs", formatRON(data.codFee)) : "",
  ].join("");

  const courseLinksHtml =
    data.courseLinks.length > 0
      ? `
      <div style="margin:28px 0;">
        ${data.courseLinks
          .map(
            (c) => `
          <a href="${c.url}" style="display:block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 20px;border-radius:999px;text-align:center;margin-bottom:10px;">
            Accesează „${escapeHtml(c.title)}”
          </a>`
          )
          .join("")}
      </div>`
      : "";

  const shippingHtml = data.shipping
    ? `
      <div style="margin:24px 0;padding:16px 20px;background:#f8fafc;border-radius:12px;">
        <p style="margin:0 0 4px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:.04em;">Livrare la</p>
        <p style="margin:0;color:#0f172a;font-size:15px;">${escapeHtml(data.shipping.address)}, ${escapeHtml(data.shipping.city)}, ${escapeHtml(data.shipping.county)}</p>
      </div>`
    : "";

  const invoiceHtml = data.invoice
    ? `<p style="color:#334155;font-size:14px;">Factura fiscală <strong>${escapeHtml(data.invoice.series)}-${data.invoice.number}</strong> a fost emisă și îți va fi trimisă separat pe email.</p>`
    : `<p style="color:#334155;font-size:14px;">Factura fiscală va fi emisă în curând și îți va fi trimisă separat pe email.</p>`;

  const html = `
  <div style="background:#f1f5f9;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;">
      <div style="background:linear-gradient(135deg, ${BRAND}, ${BRAND_DARK});padding:28px 32px;">
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:800;">Zece la Examene</p>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 12px;color:#0f172a;font-size:22px;">Salut, ${escapeHtml(data.firstName)}!</h1>
        <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.5;">
          ${
            data.orderType === "COURSE"
              ? "Plata ta a fost confirmată și ai acum acces la curs. Poți începe oricând, ai acces timp de 1 an de la achiziție."
              : "Plata ta a fost confirmată. Comanda ta e în curs de pregătire pentru livrare."
          }
        </p>

        <table style="width:100%;border-collapse:collapse;">
          ${itemsRows}
          ${feeRowsHtml}
          <tr>
            <td style="padding:14px 0 0;color:#0f172a;font-size:16px;font-weight:700;">Total</td>
            <td style="padding:14px 0 0;color:#0f172a;font-size:16px;font-weight:700;text-align:right;">${formatRON(data.total)}</td>
          </tr>
        </table>

        ${courseLinksHtml}
        ${shippingHtml}
        ${invoiceHtml}
      </div>
      <div style="padding:20px 32px;background:#f8fafc;">
        <p style="margin:0;color:#94a3b8;font-size:12px;">
          Zece la Examene · Ai o întrebare? Scrie-ne la ${escapeHtml(process.env.SMTP_FROM ?? "office@zecelaexamene.ro")}
        </p>
      </div>
    </div>
  </div>`;

  const text = [
    `Salut, ${data.firstName}!`,
    "",
    data.orderType === "COURSE"
      ? "Plata ta a fost confirmată și ai acum acces la curs (1 an de la achiziție)."
      : "Plata ta a fost confirmată. Comanda ta e în curs de pregătire pentru livrare.",
    "",
    ...data.items.map((i) => `- ${i.title}: ${formatRON(i.lineTotal)}`),
    data.discountValue > 0 ? `Reducere: -${formatRON(data.discountValue)}` : "",
    data.shippingCost > 0 ? `Transport: ${formatRON(data.shippingCost)}` : "",
    data.codFee > 0 ? `Taxă ramburs: ${formatRON(data.codFee)}` : "",
    `Total: ${formatRON(data.total)}`,
    "",
    ...data.courseLinks.map((c) => `Accesează: ${c.url}`),
    data.shipping ? `Livrare la: ${data.shipping.address}, ${data.shipping.city}, ${data.shipping.county}` : "",
    data.invoice
      ? `Factura fiscală ${data.invoice.series}-${data.invoice.number} a fost emisă.`
      : "Factura fiscală va fi emisă în curând.",
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
