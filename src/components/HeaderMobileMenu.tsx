"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/login/actions";

export function HeaderMobileMenu({
  nav,
  isLoggedIn,
  isAdmin,
}: {
  nav: { href: string; label: string }[];
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "Închide meniul" : "Deschide meniul"}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 border-b border-slate-200 bg-white px-4 py-4 shadow-lg">
          <nav className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="rounded-lg px-3 py-2.5 hover:bg-slate-50 hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-1 border-t border-slate-200 pt-3 text-sm font-medium text-slate-700">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={close}
                    className="rounded-lg px-3 py-2.5 hover:bg-slate-50 hover:text-brand"
                  >
                    Admin
                  </Link>
                )}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-slate-50 hover:text-brand"
                  >
                    Delogare
                  </button>
                </form>
                <Link
                  href="/contul-meu"
                  onClick={close}
                  className="mt-1 rounded-full bg-brand px-4 py-2.5 text-center font-semibold text-white hover:bg-brand-dark"
                >
                  Contul tău
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                onClick={close}
                className="rounded-full bg-brand px-4 py-2.5 text-center font-semibold text-white hover:bg-brand-dark"
              >
                Autentificare
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
