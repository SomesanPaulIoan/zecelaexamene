import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Trebuie să fii autentificat." }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { order: { select: { userId: true } } },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Factura nu a fost găsită." }, { status: 404 });
  }

  const owns = invoice.order.userId === user.id;
  if (!owns && user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Nu ai acces la această factură." }, { status: 403 });
  }

  if (!invoice.pdfData) {
    return NextResponse.json({ error: "PDF-ul facturii nu este disponibil." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(invoice.pdfData), {
    headers: {
      "Content-Type": "application/pdf",
      // "inline" so the link opens in a new tab and renders in the browser instead of
      // forcing a download — the filename still applies if the user saves it from there.
      "Content-Disposition": `inline; filename="factura-${invoice.series}-${invoice.number}.pdf"`,
      "Content-Length": String(invoice.pdfData.length),
    },
  });
}
