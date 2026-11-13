import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/login/actions";
import { HeaderMobileMenu } from "./HeaderMobileMenu";

const NAV = [
  { href: "/", label: "Acasă" },
  { href: "/cursuri", label: "Cursuri" },
  { href: "/carti", label: "Cărți" },
  { href: "/despre", label: "Despre noi" },
  { href: "/contact", label: "Contact" },
];

export async function Header() {
  const [user, session] = await Promise.all([getCurrentUser(), getSession()]);
  const isAdmin = Boolean(user && (user.role === "SUPERADMIN" || user.role === "TEACHER_ADMIN"));
  const cartCount = (session.cart ?? []).reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-brand-dark">
          Zece la Examene
        </Link>
        <nav className="hidden gap-8 text-sm font-medium text-slate-700 sm:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/cos"
            aria-label="Coșul meu"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l3.6-8H5.4M7 13L5.4 5M7 13l-1.7 4H17" />
              <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="text-sm font-medium text-slate-700 hover:text-brand">
                    Admin
                  </Link>
                )}
                <form action={logoutAction}>
                  <button className="text-sm font-medium text-slate-700 hover:text-brand">
                    Delogare
                  </button>
                </form>
                <Link
                  href="/contul-meu"
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Contul tău
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Autentificare
              </Link>
            )}
          </div>
          <HeaderMobileMenu nav={NAV} isLoggedIn={Boolean(user)} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
