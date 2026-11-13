export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">Ultima actualizare: {updatedAt}</p>
      <div className="prose prose-slate mt-10 max-w-none prose-h2:text-lg prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-3 prose-a:text-brand prose-strong:text-slate-900">
        {children}
      </div>
    </div>
  );
}

export function CompanyBlock() {
  return (
    <p>
      <strong>PLATFORMA ZECE LA EXAMENE SRL</strong>
      <br />
      Adresă: Împăratul Traian nr. 27, Bistrița, jud. Bistrița-Năsăud, 420145, România
      <br />
      CUI: 53187997 · Nr. Reg. Com.: J2025100580007
      <br />
      Email: <a href="mailto:office@zecelaexamene.ro">office@zecelaexamene.ro</a>
      <br />
      Telefon/WhatsApp: <a href="tel:+40744218696">+40 744 218 696</a>
    </p>
  );
}
