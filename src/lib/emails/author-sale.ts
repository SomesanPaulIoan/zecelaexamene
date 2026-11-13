import { formatRON } from "@/lib/subjects";

export type AuthorSaleItem = { title: string; amount: number; type: "COURSE" | "BOOK" };

export type AuthorSaleEmailData = {
  authorFirstName: string;
  items: AuthorSaleItem[];
  siteUrl: string;
};

const BRAND = "#1d4ed8";
const BRAND_DARK = "#1e3a8a";

export function renderAuthorSaleEmail(data: AuthorSaleEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const totalEarned = data.items.reduce((sum, i) => sum + i.amount, 0);
  const subject =
    data.items.length === 1
      ? `Vânzare nouă: ${data.items[0].title}`
      : `${data.items.length} vânzări noi pe Zece la Examene`;

  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;color:#334155;font-size:15px;border-bottom:1px solid #e2e8f0;">
          ${escapeHtml(item.title)}
          <span style="color:#94a3b8;font-size:12px;"> · ${item.type === "COURSE" ? "curs" : "carte"}</span>
        </td>
        <td style="padding:10px 0;color:#0f172a;font-size:15px;font-weight:600;text-align:right;white-space:nowrap;border-bottom:1px solid #e2e8f0;">${formatRON(item.amount)}</td>
      </tr>`
    )
    .join("");

  const html = `
  <div style="background:#f1f5f9;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;">
      <div style="background:linear-gradient(135deg, ${BRAND}, ${BRAND_DARK});padding:28px 32px;">
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:800;">Zece la Examene</p>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 12px;color:#0f172a;font-size:22px;">Salut, ${escapeHtml(data.authorFirstName)}!</h1>
        <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.5;">
          Tocmai s-a înregistrat ${data.items.length === 1 ? "o vânzare nouă" : "o comandă cu mai multe vânzări"} din conținutul tău.
        </p>

        <table style="width:100%;border-collapse:collapse;">
          ${itemsRows}
          <tr>
            <td style="padding:14px 0 0;color:#0f172a;font-size:16px;font-weight:700;">Total câștigat</td>
            <td style="padding:14px 0 0;color:#0f172a;font-size:16px;font-weight:700;text-align:right;">${formatRON(totalEarned)}</td>
          </tr>
        </table>

        <a href="${data.siteUrl}/admin" style="display:block;margin-top:28px;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 20px;border-radius:999px;text-align:center;">
          Vezi situația ta completă
        </a>
      </div>
      <div style="padding:20px 32px;background:#f8fafc;">
        <p style="margin:0;color:#94a3b8;font-size:12px;">Zece la Examene</p>
      </div>
    </div>
  </div>`;

  const text = [
    `Salut, ${data.authorFirstName}!`,
    "",
    `Tocmai s-a înregistrat ${data.items.length === 1 ? "o vânzare nouă" : "o comandă cu mai multe vânzări"} din conținutul tău.`,
    "",
    ...data.items.map((i) => `- ${i.title} (${i.type === "COURSE" ? "curs" : "carte"}): ${formatRON(i.amount)}`),
    `Total câștigat: ${formatRON(totalEarned)}`,
    "",
    `Vezi situația ta completă: ${data.siteUrl}/admin`,
  ].join("\n");

  return { subject, html, text };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
