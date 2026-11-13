import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { getSiteOrigin } from "@/lib/site-url";

export async function POST(request: Request) {
  const origin = getSiteOrigin();
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const message = String(formData.get("message") ?? "");

  if (!(await verifyRecaptcha(formData.get("g-recaptcha-response")))) {
    return NextResponse.json({ error: "Verificarea reCAPTCHA a eșuat. Te rugăm să reîncerci." }, { status: 400 });
  }

  // Saved so it can be tracked from /admin/mesaje, not just via email.
  await prisma.contactMessage.create({ data: { name, email, phone, message } });

  await sendMail({
    to: "office@zecelaexamene.ro",
    cc: process.env.OWNER_NOTIFY_EMAIL,
    subject: `Mesaj de contact de la ${name}`,
    text: `De la: ${name} <${email}> · ${phone}\n\n${message}`,
  });

  return NextResponse.redirect(`${origin}/contact?trimis=1`, 303);
}
