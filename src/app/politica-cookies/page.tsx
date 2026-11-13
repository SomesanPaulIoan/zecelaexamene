import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, CompanyBlock } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Politica de cookies" };

export default function CookiesPage() {
  return (
    <LegalPage title="Politica de cookies" updatedAt="17.09.2026">
      <h2>1. Ce sunt cookie-urile</h2>
      <p>
        Cookie-urile sunt fișiere text de mici dimensiuni, stocate pe dispozitivul dumneavoastră
        (computer, telefon, tabletă) atunci când vizitați un site web. Sunt folosite pe scară
        largă pentru ca site-urile să funcționeze corect, să fie mai eficiente și pentru a
        oferi informații utile proprietarilor site-ului.
      </p>

      <h2>2. Cine utilizează cookie-urile</h2>
      <p>
        Site-ul <strong>www.zecelaexamene.ro</strong> este deținut și administrat de{" "}
        <strong>PLATFORMA ZECE LA EXAMENE SRL</strong>, CUI 53187997. În anumite situații,
        cookie-uri pot fi plasate și de terți (de exemplu, procesatorul de plăți sau widget-ul
        de alegere a lockerului de livrare).
      </p>

      <h2>3. Ce tipuri de cookie-uri folosim</h2>
      <p><strong>3.1. Strict necesare</strong> — esențiale pentru funcționarea Platformei: autentificare, menținerea sesiunii și a coșului de cumpărături, securitate. Nu pot fi dezactivate.</p>
      <p><strong>3.2. Funcționalitate</strong> — permit Platformei să rețină preferințele dumneavoastră (de exemplu, codul de reducere aplicat).</p>
      <p><strong>3.3. Performanță și analiză</strong> — ne ajută să înțelegem cum este folosită Platforma, pentru a-i îmbunătăți funcționarea.</p>

      <h2>4. Cookie-uri plasate de terți</h2>
      <p>Anumite servicii pe care le folosim pot plasa propriile cookie-uri:</p>
      <ul>
        <li><strong>Stripe</strong> — strict pentru securitatea și procesarea plății cu cardul.</li>
        <li><strong>Sameday (widget de alegere locker)</strong> — pentru afișarea și selectarea lockerelor easyBox disponibile.</li>
      </ul>
      <p>
        Nu controlăm cookie-urile plasate de acești terți. Pentru detalii, vă recomandăm să
        consultați politicile lor proprii de confidențialitate.
      </p>

      <h2>5. Cum puteți controla cookie-urile</h2>
      <p>
        Puteți controla sau șterge cookie-urile din setările browserului dumneavoastră —
        majoritatea browserelor vă permit să vedeți cookie-urile existente, să le ștergeți sau
        să blocați plasarea unora noi. Dezactivarea cookie-urilor strict necesare poate afecta
        funcționarea corectă a Platformei (de exemplu, nu veți putea rămâne autentificat).
      </p>

      <h2>6. Stocarea și durata de viață</h2>
      <p>
        Cookie-urile de sesiune sunt șterse automat la închiderea browserului. Cookie-ul de
        autentificare este persistent și este valabil 30 de zile.
      </p>

      <h2>7. Legătura cu Politica de Confidențialitate</h2>
      <p>
        Pentru informații complete despre cum prelucrăm datele personale, consultați{" "}
        <Link href="/politica-confidentialitate">Politica de Confidențialitate</Link>.
      </p>

      <h2>8. Actualizări</h2>
      <p>
        Această politică poate fi actualizată periodic. Versiunea curentă, cu data ultimei
        actualizări, este întotdeauna publicată pe această pagină.
      </p>

      <h2>9. Contact</h2>
      <CompanyBlock />
    </LegalPage>
  );
}
