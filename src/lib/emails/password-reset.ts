const BRAND = "#1d4ed8";
const BRAND_DARK = "#1e3a8a";

export function renderPasswordResetEmail(data: { firstName: string; resetUrl: string }) {
  const subject = "Resetează-ți parola — Zece la Examene";

  const html = `
  <div style="background:#f1f5f9;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;">
      <div style="background:linear-gradient(135deg, ${BRAND}, ${BRAND_DARK});padding:28px 32px;">
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:800;">Zece la Examene</p>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 12px;color:#0f172a;font-size:22px;">Salut, ${escapeHtml(data.firstName)}!</h1>
        <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.5;">
          Am primit o cerere de resetare a parolei pentru contul tău. Apasă pe butonul de mai jos
          pentru a-ți seta o parolă nouă. Linkul este valabil <strong>1 oră</strong>.
        </p>
        <a href="${data.resetUrl}" style="display:block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 20px;border-radius:999px;text-align:center;">
          Resetează parola
        </a>
        <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">
          Dacă nu ai solicitat această resetare, poți ignora acest email — parola ta rămâne neschimbată.
        </p>
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
    "Am primit o cerere de resetare a parolei pentru contul tău.",
    `Resetează-ți parola aici (valabil 1 oră): ${data.resetUrl}`,
    "",
    "Dacă nu ai solicitat această resetare, poți ignora acest email.",
  ].join("\n");

  return { subject, html, text };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
