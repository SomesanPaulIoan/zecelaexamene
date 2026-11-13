import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { Recaptcha } from "@/components/Recaptcha";

export const metadata: Metadata = { title: "Formular de retragere / retur" };

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none";
const labelClass = "block text-sm font-medium text-slate-700";

export default async function WithdrawalFormPage({
  searchParams,
}: {
  searchParams: Promise<{ trimis?: string }>;
}) {
  const { trimis } = await searchParams;

  return (
    <LegalPage title="Formular de retragere / retur" updatedAt="17.09.2026">
      <h2>Ce se poate returna</h2>
      <p>
        Conform OUG 34/2014 privind drepturile consumatorilor, tratamentul e diferit pentru
        cărți (produse fizice) și cursuri (conținut digital):
      </p>
      <ul>
        <li>
          <strong>Cărți</strong> — beneficiați de dreptul de retragere, fără justificare, în
          termen de <strong>14 zile calendaristice</strong> de la data la care intrați în
          posesia produsului. Produsul trebuie returnat nefolosit, în aceeași stare, în ambalaj
          adecvat. Costul returului este suportat de dumneavoastră, cu excepția cazului în
          care produsul este neconform sau a fost livrat greșit.
        </li>
        <li>
          <strong>Cursuri</strong> — odată ce ați confirmat explicit, la finalizarea comenzii,
          că doriți începerea imediată a furnizării conținutului digital, dreptul de retragere
          încetează (art. 16 lit. m, OUG 34/2014) — cursul nu mai poate fi returnat, iar suma
          nu se rambursează. Excepție fac cazurile de neconformitate dovedită sau eroare
          tehnică imputabilă Platformei — scrieți-ne direct la{" "}
          <a href="mailto:office@zecelaexamene.ro">office@zecelaexamene.ro</a> pentru aceste situații.
        </li>
      </ul>
      <p>
        Detalii complete despre retur sunt disponibile în{" "}
        <Link href="/termeni-si-conditii">Termenii și condițiile</Link> noastre, secțiunea 8.
      </p>

      <h2>Cum funcționează</h2>
      <p>
        Completați formularul de mai jos pentru a ne notifica decizia de retragere dintr-o
        comandă de cărți. Aceasta reprezintă o declarație neechivocă de retragere, în sensul
        legii. Vă vom confirma pe email primirea cererii și pașii următori (adresa de retur,
        dacă e cazul).
      </p>

      {trimis && (
        <p className="not-prose rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Am primit cererea ta! Îți vom răspunde pe email în cel mai scurt timp.
        </p>
      )}

      <form action="/api/retur" method="POST" className="not-prose mt-8 space-y-4 rounded-2xl border border-slate-200 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nume complet</label>
            <input name="name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" name="email" required className={inputClass} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Telefon</label>
            <input type="tel" name="phone" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Număr comandă (din emailul de confirmare)</label>
            <input name="orderReference" required className={inputClass} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Data comenzii (opțional)</label>
            <input type="date" name="orderDate" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Produs(e) pe care doriți să le returnați</label>
          <input name="product" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>IBAN pentru rambursare (opțional — dacă diferă de cardul folosit la plată)</label>
          <input name="iban" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Motiv (opțional)</label>
          <textarea name="reason" rows={3} className={inputClass} />
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" required className="mt-1" />
          Prin prezenta, notific retragerea mea din contractul de vânzare a produsului/produselor
          de mai sus.
        </label>
        <Recaptcha />
        <button
          type="submit"
          className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Trimite cererea de retragere
        </button>
      </form>
    </LegalPage>
  );
}
