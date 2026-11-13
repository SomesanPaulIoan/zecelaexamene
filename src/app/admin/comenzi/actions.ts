"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { generateInvoiceForOrder } from "@/lib/invoicing";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

export async function retryInvoiceAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);
  const orderId = String(formData.get("orderId") ?? "");
  await generateInvoiceForOrder(orderId);
  revalidatePath("/admin/comenzi");
}

export async function markShippedAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);
  const orderId = String(formData.get("orderId") ?? "");

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.shippedAt) return; // already marked, idempotent

  await prisma.order.update({ where: { id: orderId }, data: { shippedAt: new Date() } });

  const isEasyBox = order.shippingMethod === "sameday_easybox";
  const destination = isEasyBox
    ? `${order.lockerName ?? ""} — ${[order.lockerAddress, order.lockerCity, order.lockerCounty].filter(Boolean).join(", ")}`
    : [order.shippingAddress, order.shippingCity, order.shippingCounty, order.shippingPostal].filter(Boolean).join(", ");

  const bodyHtml = isEasyBox
    ? `Salutare ${order.billingName},<br><br>
       Tocmai ți-am expediat comanda către <strong>easyBox Sameday</strong>.<br>
       Locker: <strong>${order.lockerName ?? ""}</strong><br>
       Locație: ${destination}<br><br>
       Vei primi SMS de la Sameday când ajunge coletul în locker. Timp estimat: <strong>1–2 zile lucrătoare</strong>.<br><br>
       Mulțumim că ai ales Zece la Examene!`
    : `Salutare ${order.billingName},<br><br>
       Comanda ta a fost predată curierului și este în drum spre tine.<br>
       Adresă livrare: ${destination}<br><br>
       Timp estimat: <strong>1–2 zile lucrătoare</strong>.<br><br>
       Mulțumim că ai ales Zece la Examene!`;

  await sendMail({
    to: order.billingEmail,
    subject: `Comanda ta este pe drum!`,
    html: bodyHtml,
    text: bodyHtml.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, ""),
  });

  revalidatePath("/admin/comenzi");
}
