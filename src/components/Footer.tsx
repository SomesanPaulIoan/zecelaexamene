import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-brand-dark">Zece la Examene</p>
            <p className="mt-2 text-sm text-slate-600">
              Cursuri online și cărți de pregătire pentru Bacalaureat și admitere la
              facultate.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Platformă</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li><Link href="/cursuri" className="hover:text-brand">Cursuri</Link></li>
              <li><Link href="/carti" className="hover:text-brand">Cărți</Link></li>
              <li><Link href="/despre" className="hover:text-brand">Despre noi</Link></li>
              <li><Link href="/contact" className="hover:text-brand">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Legal</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li><Link href="/termeni-si-conditii" className="hover:text-brand">Termeni și condiții</Link></li>
              <li><Link href="/politica-confidentialitate" className="hover:text-brand">Confidențialitate</Link></li>
              <li><Link href="/politica-cookies" className="hover:text-brand">Cookies</Link></li>
              <li><Link href="/formular-retragere" className="hover:text-brand">Formular de retragere</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Soluționarea litigiilor</p>
            <p className="mt-2 text-sm text-slate-600">
              Sunt disponibil pentru soluționarea directă a oricărei probleme — scrieți-mi pe WhatsApp la{" "}
              <a
                href="https://wa.me/40744218696"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand hover:underline"
              >
                0744 218 696
              </a>
              .
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Dacă nu găsim o soluție amiabilă, puteți apela la:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>
                <a href="https://eservicii.anpc.ro/" target="_blank" rel="noopener noreferrer" className="hover:text-brand">
                  A.N.P.C.
                </a>
              </li>
              <li>
                <a href="https://reclamatiisal.anpc.ro/" target="_blank" rel="noopener noreferrer" className="hover:text-brand">
                  A.N.P.C. — SAL
                </a>
              </li>
              <li>
                <a href="https://consumer-redress.ec.europa.eu/index_ro" target="_blank" rel="noopener noreferrer" className="hover:text-brand">
                  SOL (platforma UE)
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PLATFORMA ZECE LA EXAMENE SRL. Toate drepturile rezervate.</p>
          <p>CUI 53187997 · Nr. Reg. Com. J2025100580007</p>
        </div>
      </div>
    </footer>
  );
}
