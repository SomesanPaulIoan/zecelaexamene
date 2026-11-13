import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, CompanyBlock } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Politica de confidențialitate" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Politica de confidențialitate" updatedAt="17.09.2026">
      <h2>1. Cine suntem (Operatorul datelor)</h2>
      <p>
        Site-ul <strong>www.zecelaexamene.ro</strong> („Platforma”) este deținut și operat de{" "}
        <strong>PLATFORMA ZECE LA EXAMENE SRL</strong>, cu sediul în România, Adresă:
        Împăratul Traian nr. 27, Bistrița, jud. Bistrița-Năsăud, 420145, CUI: 53187997, Nr.
        Reg. Com.: J2025100580007 („Societatea”, „Operatorul”).
      </p>
      <p>
        Pentru orice întrebări despre datele personale: Email:{" "}
        <a href="mailto:office@zecelaexamene.ro">office@zecelaexamene.ro</a> ·
        Telefon/WhatsApp: <a href="tel:+40744218696">+40 744 218 696</a>
      </p>

      <h2>2. Ce date colectăm</h2>
      <p><strong>2.1. Date de cont:</strong> nume, prenume, adresă de e-mail, parolă (stocată criptat), preferințe de cont.</p>
      <p><strong>2.2. Date de facturare și livrare:</strong> nume/denumire firmă, CUI (pentru facturare pe firmă), adresă de facturare, adresă de livrare sau locker easyBox ales.</p>
      <p><strong>2.3. Date despre plăți:</strong> plățile cu cardul sunt procesate de <strong>Stripe</strong>; noi primim doar confirmarea și un identificator de tranzacție, fără să accesăm sau să stocăm numărul cardului.</p>
      <p><strong>2.4. Date de utilizare:</strong> pagini vizitate, cursuri accesate, adresă IP, tip dispozitiv și browser, în scop de securitate și îmbunătățire a Platformei.</p>
      <p><strong>2.5. Comunicare:</strong> mesajele trimise prin formularul de contact sau prin email.</p>

      <h2>3. De ce colectăm datele (scopuri și temeiuri legale)</h2>
      <p><strong>3.1. Executarea contractului:</strong> crearea contului, acordarea accesului la cursuri, livrarea cărților, gestionarea comenzilor și a cererilor de retur.</p>
      <p><strong>3.2. Obligații legale:</strong> emiterea facturilor și evidențele contabile impuse de legislația fiscală.</p>
      <p><strong>3.3. Interes legitim:</strong> securitatea Platformei, prevenirea fraudei, protecția Conținutului, îmbunătățirea serviciilor.</p>
      <p><strong>3.4. Consimțământ:</strong> comunicări de marketing, doar dacă v-ați dat acordul explicit — vă puteți dezabona oricând.</p>

      <h2>4. Cui divulgăm datele</h2>
      <p>Nu vindem și nu închiriem datele dumneavoastră. Le putem divulga doar către:</p>
      <ul>
        <li><strong>Stripe</strong> — procesarea plăților cu cardul.</li>
        <li><strong>SmartBill</strong> — emiterea facturilor fiscale.</li>
        <li><strong>Sameday</strong> — livrarea comenzilor cu cărți (curier și rețeaua de easyBox).</li>
        <li><strong>Hostinger</strong> — furnizorul nostru de hosting și email.</li>
        <li>Autorități publice, atunci când există o obligație legală sau o solicitare validă.</li>
        <li>Consultanți contabili/juridici, strict în măsura necesară.</li>
      </ul>

      <h2>5. Cât timp păstrăm datele</h2>
      <p><strong>5.1.</strong> Datele de cont — cât timp aveți un cont activ, sau cât este necesar pentru apărarea drepturilor noastre ori ale dumneavoastră.</p>
      <p><strong>5.2.</strong> Datele financiar-contabile — pe durata impusă de legislația fiscală.</p>
      <p><strong>5.3.</strong> Logurile de securitate — pe perioade rezonabile, pentru prevenirea și investigarea fraudei/abuzului.</p>

      <h2>6. Securitatea datelor</h2>
      <p>
        Implementăm măsuri tehnice și organizatorice pentru protejarea datelor: conexiuni
        securizate (HTTPS), parole stocate criptat, control al accesului și monitorizare a
        evenimentelor de securitate. Niciun sistem nu este 100% sigur — vă recomandăm să
        păstrați confidențialitatea parolei dumneavoastră.
      </p>

      <h2>7. Drepturile dumneavoastră</h2>
      <p>În condițiile legii (Regulamentul GDPR), aveți dreptul la:</p>
      <ul>
        <li><strong>Acces</strong> la datele dumneavoastră personale.</li>
        <li><strong>Rectificare</strong> a datelor incorecte.</li>
        <li><strong>Ștergere</strong> („dreptul de a fi uitat”), în limitele obligațiilor legale.</li>
        <li><strong>Restricționare</strong> a prelucrării.</li>
        <li><strong>Portabilitate</strong> a datelor, unde este aplicabil.</li>
        <li><strong>Opoziție</strong> la prelucrarea bazată pe interes legitim.</li>
        <li><strong>Retragerea consimțământului</strong> pentru marketing, oricând.</li>
        <li><strong>Plângere</strong> la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), dacă considerați că drepturile v-au fost încălcate.</li>
      </ul>
      <p>Pentru exercitarea oricărui drept, scrieți-ne la <a href="mailto:office@zecelaexamene.ro">office@zecelaexamene.ro</a>.</p>

      <h2>8. Politica privind minorii</h2>
      <p>
        Platforma poate fi utilizată de minori doar cu acordul și sub supravegherea
        părintelui/tutorelui legal. Nu colectăm intenționat date de la copii sub 16 ani fără
        consimțământul părintelui/tutorelui legal.
      </p>

      <h2>9. Cookie-uri</h2>
      <p>
        Folosim cookie-uri pentru funcționare, autentificare și analiză. Detalii complete și
        opțiuni de control găsiți în <Link href="/politica-cookies">Politica de Cookies</Link>.
      </p>

      <h2>10. Actualizări ale politicii</h2>
      <p>
        Putem actualiza această politică periodic. Versiunea curentă, cu data ultimei
        actualizări, este întotdeauna publicată pe această pagină.
      </p>

      <h2>11. Contact</h2>
      <CompanyBlock />
    </LegalPage>
  );
}
