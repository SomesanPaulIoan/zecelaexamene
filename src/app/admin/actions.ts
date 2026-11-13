"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { recordBeneficiaryPayment } from "@/lib/ledger";

export async function recordBeneficiaryPaymentAction(_prevState: string | null, formData: FormData) {
  const user = await requireRole(["SUPERADMIN"]);

  const beneficiaryId = String(formData.get("beneficiaryId") ?? "");
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim() || null;
  const paidAtRaw = String(formData.get("paidAt") ?? "").trim();

  if (!beneficiaryId || !Number.isFinite(amount) || amount === 0) {
    return "Introdu o sumă validă.";
  }

  const paidAt = paidAtRaw ? new Date(paidAtRaw) : new Date();
  if (Number.isNaN(paidAt.getTime())) {
    return "Data plății nu este validă.";
  }

  await recordBeneficiaryPayment(beneficiaryId, amount, note, `${user.firstName} ${user.lastName}`, paidAt);
  revalidatePath("/admin");
  return null;
}
