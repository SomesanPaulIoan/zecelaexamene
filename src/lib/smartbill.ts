import "server-only";

const SMARTBILL_BASE_URL = "https://ws.smartbill.ro/SBORO/api";

export type SmartBillProduct = {
  name: string;
  quantity: number;
  price: number; // unit price
};

export type SmartBillClient = {
  name: string;
  email?: string;
  address?: string;
  city?: string;
  county?: string;
};

export type SmartBillInvoiceInput = {
  client: SmartBillClient;
  products: SmartBillProduct[];
  issueDate: string; // YYYY-MM-DD
  mentions?: string;
};

export type SmartBillInvoiceResult = { series: string; number: string };

function authHeader() {
  const username = process.env.SMARTBILL_USERNAME;
  const token = process.env.SMARTBILL_TOKEN;
  if (!username || !token) return null;
  return "Basic " + Buffer.from(`${username}:${token}`).toString("base64");
}

export function isSmartBillConfigured() {
  return !!authHeader() && !!process.env.SMARTBILL_CIF;
}

// Company is not a VAT payer (confirmed by the owner) — every invoice is 0%, "Neimpozabil".
const TAX_NAME = "Neimpozabil";

/**
 * Payload shape mirrors the legacy site's proven-working SmartBill integration
 * (checkout/success.php) — `isService: true` + `taxName` per product line, no
 * `isTaxIncluded`/`taxPercentage` fields (those aren't part of the working request shape).
 */
export async function createSmartBillInvoice(
  input: SmartBillInvoiceInput
): Promise<SmartBillInvoiceResult> {
  const auth = authHeader();
  const cif = process.env.SMARTBILL_CIF;
  if (!auth || !cif) {
    throw new Error("SmartBill is not configured (SMARTBILL_USERNAME/SMARTBILL_TOKEN/SMARTBILL_CIF).");
  }

  const body = {
    companyVatCode: cif,
    client: {
      name: input.client.name || "Client",
      vatCode: "",
      isTaxPayer: false,
      address: input.client.address ?? "",
      city: input.client.city ?? "",
      county: input.client.county ?? "",
      country: "Romania",
      email: input.client.email ?? "",
      saveToDb: false,
    },
    issueDate: input.issueDate,
    dueDate: input.issueDate,
    deliveryDate: input.issueDate,
    seriesName: process.env.SMARTBILL_SERIES ?? "ZLE",
    isDraft: false,
    products: input.products.map((p) => ({
      name: p.name,
      measuringUnitName: "buc",
      currency: "RON",
      quantity: p.quantity,
      price: Math.round(p.price * 100) / 100,
      isService: true,
      taxName: TAX_NAME,
      saveToDb: false,
    })),
    mentions: input.mentions ?? "",
  };

  // The legacy integration tries /invoice/v2 first, falling back to /invoice — some
  // SmartBill accounts only have one of the two enabled.
  const v2 = await postInvoice("/invoice/v2", auth, body);
  if (v2.ok) return v2.result!;
  const v1 = await postInvoice("/invoice", auth, body);
  if (v1.ok) return v1.result!;
  throw new Error(`SmartBill invoice creation failed: ${v1.error ?? v2.error}`);
}

async function postInvoice(
  path: string,
  auth: string,
  body: unknown
): Promise<{ ok: boolean; result?: SmartBillInvoiceResult; error?: string }> {
  try {
    const res = await fetch(`${SMARTBILL_BASE_URL}${path}`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as { number?: string; seriesName?: string; series?: string } | null;
    if (!res.ok || !json?.number) {
      return { ok: false, error: `${res.status} ${JSON.stringify(json)}` };
    }
    return { ok: true, result: { series: json.seriesName ?? json.series ?? "ZLE", number: json.number } };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Downloads the invoice PDF as raw bytes. Mirrors the legacy site's retry matrix — some
 * SmartBill accounts expect `seriesname` vs `seriesName`, and the number as-is vs coerced
 * to an integer string.
 */
export async function downloadSmartBillInvoicePdf(series: string, number: string): Promise<Uint8Array | null> {
  const auth = authHeader();
  const cif = process.env.SMARTBILL_CIF;
  if (!auth || !cif) return null;

  const numInt = String(parseInt(number, 10));
  const variants: Array<Record<string, string>> = [
    { cif, seriesname: series, number },
    { cif, seriesname: series, number: numInt },
    { cif, seriesName: series, number },
    { cif, seriesName: series, number: numInt },
  ];

  for (const params of variants) {
    try {
      const res = await fetch(`${SMARTBILL_BASE_URL}/invoice/pdf?${new URLSearchParams(params)}`, {
        headers: { Authorization: auth },
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.subarray(0, 5).toString("latin1") === "%PDF-") return buf;
    } catch {
      // try next variant
    }
  }
  return null;
}
