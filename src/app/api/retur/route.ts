import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { getSiteOrigin } from "@/lib/site-url";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function POST(request: Request) {
  const origin = getSiteOrigin();
  const formData = await request.formData();

  const name = field(formData, "name");
  const email = field(formData, "email");
  const phone = field(formData, "phone");
  const orderReference = field(formData, "orderReference");
  const product = field(formData, "product");
  const orderDate = field(formData, "orderDate");
  const iban = field(formData, "iban");
  const reason = field(formData, "reason");

  if (!name || !email || !phone || !orderReference || !product) {
    return NextResponse.json({ error: "Completează toate câmpurile obligatorii." }, { status: 400 });
  }

  if (!(await verifyRecaptcha(formData.get("g-recaptcha-response")))) {
    return NextResponse.json({ error: "Verificarea reCAPTCHA a eșuat. Te rugăm să reîncerci." }, { status: 400 });
  }

  // Saved so it can be tracked from /admin/mesaje, not just via email.
  await prisma.returnRequest.create({
    data: { name, email, phone, orderReference, product, orderDate: orderDate || null, iban: iban || null, reason: reason || null },
  });

  const body = `Cerere de retragere / retur primită prin formularul de pe site.

Nume: ${name}
Email: ${email}
Telefon: ${phone}
Comandă / referință: ${orderReference}
Data comenzii: ${orderDate || "—"}
Produs(e) returnat(e): ${product}
IBAN pentru rambursare: ${iban || "—"}
Motiv (opțional): ${reason || "—"}

Prin trimiterea acestui formular, clientul notifică retragerea din contract conform OUG 34/2014.`;

  await sendMail({
    to: "office@zecelaexamene.ro",
    cc: process.env.OWNER_NOTIFY_EMAIL,
    subject: `Cerere de retragere — comanda ${orderReference}`,
    text: body,
  });

  // Confirmation copy to the customer, so they have a timestamped record of their notice.
  await sendMail({
    to: email,
    subject: "Am primit cererea ta de retragere",
    text: `Salut, ${name}!\n\nAm primit cererea ta de retragere pentru comanda ${orderReference}. Îți vom confirma pe email sau la telefonul ${phone} pașii următori și, dacă e cazul, adresa la care trebuie trimis coletul înapoi.\n\n— Zece la Examene`,
  });

  return NextResponse.redirect(`${origin}/formular-retragere?trimis=1`, 303);
}
