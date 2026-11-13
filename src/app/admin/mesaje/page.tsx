import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateContactStatusAction, updateReturnStatusAction } from "./actions";

const TABS = [
  { key: "contact", label: "Formular de contact" },
  { key: "retur", label: "Formular de retragere" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function whatsappLink(phone: string) {
  const digits = phone.replace(/[^\d]/g, "").replace(/^0/, "40");
  return `https://wa.me/${digits}`;
}

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nou",
  IN_PROGRESS: "În lucru",
  DONE: "Rezolvat",
};
const STATUS_OPTIONS = ["NEW", "IN_PROGRESS", "DONE"] as const;

function StatusButtons({
  id,
  status,
  action,
}: {
  id: string;
  status: string;
  action: (formData: FormData) => void;
}) {
  return (
    <div className="flex gap-1">
      {STATUS_OPTIONS.map((s) => (
        <form key={s} action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={s} />
          <button
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              status === s ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        </form>
      ))}
    </div>
  );
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ tip?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPERADMIN") redirect("/admin");

  const { tip } = await searchParams;
  const tab: TabKey = TABS.some((t) => t.key === tip) ? (tip as TabKey) : "contact";

  const [contactMessages, returnRequests, contactNewCount, returnNewCount] = await Promise.all([
    tab === "contact"
      ? prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
      : Promise.resolve([]),
    tab === "retur"
      ? prisma.returnRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
      : Promise.resolve([]),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.returnRequest.count({ where: { status: "NEW" } }),
  ]);

  const badgeFor = (key: TabKey) => (key === "contact" ? contactNewCount : returnNewCount);

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-full bg-slate-100 p-1 text-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/mesaje?tip=${t.key}`}
            className={`whitespace-nowrap rounded-full px-4 py-2 font-medium transition ${
              tab === t.key ? "bg-brand text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
            {badgeFor(t.key) > 0 && (
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                  tab === t.key ? "bg-white/20" : "bg-brand text-white"
                }`}
              >
                {badgeFor(t.key)}
              </span>
            )}
          </Link>
        ))}
      </div>

      {tab === "contact" ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Dată</th>
                <th className="px-4 py-3 font-medium">Nume</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Telefon</th>
                <th className="px-4 py-3 font-medium">Mesaj</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {contactMessages.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {m.createdAt.toLocaleDateString("ro-RO")}
                  </td>
                  <td className="px-4 py-3 text-slate-900">{m.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <a href={`mailto:${m.email}`} className="hover:text-brand hover:underline">
                      {m.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {m.phone ? (
                      <a
                        href={whatsappLink(m.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        {m.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="max-w-md px-4 py-3 text-slate-600">{m.message}</td>
                  <td className="px-4 py-3">
                    <StatusButtons id={m.id} status={m.status} action={updateContactStatusAction} />
                  </td>
                </tr>
              ))}
              {contactMessages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Niciun mesaj de contact.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Dată</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Comandă</th>
                <th className="px-4 py-3 font-medium">Produs(e)</th>
                <th className="px-4 py-3 font-medium">IBAN</th>
                <th className="px-4 py-3 font-medium">Motiv</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {returnRequests.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {r.createdAt.toLocaleDateString("ro-RO")}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    <p>{r.name}</p>
                    <p className="text-xs text-slate-500">
                      <a href={`mailto:${r.email}`} className="hover:text-brand hover:underline">
                        {r.email}
                      </a>{" "}
                      · {r.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.orderReference}
                    {r.orderDate && <p className="text-xs text-slate-400">{r.orderDate}</p>}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-600">{r.product}</td>
                  <td className="px-4 py-3 text-slate-600">{r.iban || "—"}</td>
                  <td className="max-w-xs px-4 py-3 text-slate-600">{r.reason || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusButtons id={r.id} status={r.status} action={updateReturnStatusAction} />
                  </td>
                </tr>
              ))}
              {returnRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Nicio cerere de retragere.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
