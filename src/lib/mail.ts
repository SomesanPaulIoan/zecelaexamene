import "server-only";
import nodemailer from "nodemailer";

let _transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!_transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS (negotiated automatically)
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
  }
  return _transporter;
}

export async function sendMail(opts: {
  to: string;
  cc?: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[mail] SMTP not configured — skipping email to ${opts.to}: ${opts.subject}`);
    return;
  }
  // Shows as "Zece la Examene" in the client, not the raw no-reply@... address, so it
  // doesn't read as an automated/no-reply sender.
  await transporter.sendMail({ from: `"Zece la Examene" <${process.env.SMTP_FROM}>`, ...opts });
}
