import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPERADMIN" && user.role !== "TEACHER_ADMIN") redirect("/");

  const newMessagesCount =
    user.role === "SUPERADMIN"
      ? await Promise.all([
          prisma.contactMessage.count({ where: { status: "NEW" } }),
          prisma.returnRequest.count({ where: { status: "NEW" } }),
        ]).then(([a, b]) => a + b)
      : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Panou admin</p>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {user.role === "SUPERADMIN" ? "Toate veniturile" : user.beneficiary?.name}
          </h1>
        </div>
        <nav className="flex gap-4 text-sm font-medium text-slate-600">
          <Link href="/admin" className="hover:text-brand">
            Venituri
          </Link>
          {user.role === "SUPERADMIN" && (
            <>
              <Link href="/admin/comenzi" className="hover:text-brand">
                Comenzi
              </Link>
              <Link href="/admin/utilizatori" className="hover:text-brand">
                Utilizatori
              </Link>
              <Link href="/admin/carti" className="hover:text-brand">
                Cărți
              </Link>
              <Link href="/admin/coduri-reducere" className="hover:text-brand">
                Coduri reducere
              </Link>
              <Link href="/admin/mesaje" className="hover:text-brand">
                Mesaje
                {newMessagesCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-xs text-white">
                    {newMessagesCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
