import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, CompanyBlock } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Termeni și condiții" };

export default function TermsPage() {
  return (
    <LegalPage title="Termeni și condiții" updatedAt="17.09.2026">
      <h2>1. Identificarea operatorului</h2>
      <p>
        Site-ul <strong>www.zecelaexamene.ro</strong> („Platforma”) este deținut și administrat de{" "}
        <strong>PLATFORMA ZECE LA EXAMENE SRL</strong>, cu sediul social în România, Adresă:
        Împăratul Traian nr. 27, Bistrița, jud. Bistrița-Năsăud, 420145, CUI: 53187997, Nr.
        Reg. Com.: J2025100580007 („Societatea”, „noi”). Societatea nu este plătitoare de TVA,
        motiv pentru care toate prețurile afișate sunt finale, fără TVA.
      </p>
      <p>
        Contact: <a href="mailto:office@zecelaexamene.ro">office@zecelaexamene.ro</a> ·
        Telefon/WhatsApp: <a href="tel:+40744218696">+40 744 218 696</a>
      </p>

      <h2>2. Definiții</h2>
      <ul>
        <li><strong>Utilizator</strong> — orice persoană care accesează Platforma.</li>
        <li><strong>Client</strong> — Utilizator care achiziționează produse/servicii de pe Platformă.</li>
        <li><strong>Cont</strong> — profil creat de Utilizator pentru acces și gestionarea achizițiilor.</li>
        <li><strong>Curs</strong> — serviciu digital educațional (acces online la lecții video, materiale, teste), livrat pe durata specificată în pagina cursului.</li>
        <li><strong>Carte</strong> — produs educațional tipărit, livrat fizic prin curier sau easyBox.</li>
        <li><strong>Conținut</strong> — orice text, video, imagine, exercițiu, explicație, design sau cod aparținând Platformei.</li>
      </ul>

      <h2>3. Acceptarea termenilor</h2>
      <p>
        Prin crearea unui Cont, plasarea unei comenzi sau utilizarea oricărei funcționalități a
        Platformei, confirmați că ați citit, înțeles și acceptat acești Termeni și Condiții.
        Dacă nu sunteți de acord, vă rugăm să nu utilizați Platforma.
      </p>

      <h2>4. Eligibilitate. Cont. Securitate</h2>
      <p>
        Platforma poate fi utilizată de persoane care au împlinit 18 ani. Minorii pot utiliza
        Platforma doar cu acordul și sub supravegherea părintelui/tutorelui legal, care își
        asumă responsabilitatea pentru activitate și plăți.
      </p>
      <p>
        Sunteți responsabil(ă) pentru confidențialitatea datelor de acces și pentru toate
        acțiunile efectuate din Cont. Dacă suspectați acces neautorizat, anunțați-ne imediat la{" "}
        <a href="mailto:office@zecelaexamene.ro">office@zecelaexamene.ro</a>.
      </p>

      <h2>5. Produse și servicii oferite</h2>
      <h3>5.1. Cursuri (servicii digitale)</h3>
      <p>
        Cursurile sunt servicii digitale livrate prin acces online în Cont (lecții video,
        materiale). Durata accesului este de <strong>1 an de la data achiziției</strong>, cu
        excepția cazului în care pagina cursului indică altfel.
      </p>
      <h3>5.2. Cărți (tipărite)</h3>
      <p>
        Cărțile sunt produse fizice, livrate prin curier sau prin rețeaua de easyBox Sameday, la
        alegerea Clientului în checkout. Condițiile de livrare și retur sunt detaliate la
        Secțiunile 8 și 9.
      </p>

      <h2>6. Comenzi. Plăți. Facturare</h2>
      <p>
        Prețurile sunt afișate pe Platformă în lei (RON) și sunt finale (Societatea nu este
        plătitoare de TVA). Plata se poate face online, cu cardul, prin{" "}
        <strong>Stripe</strong>, sau — pentru cărți — prin{" "}
        <strong>ramburs la livrare</strong>. Comanda se consideră confirmată în momentul în
        care primiți confirmarea plății pe email.
      </p>
      <p>
        Sunteți responsabil(ă) să furnizați date corecte pentru facturare. Facturile se emit
        electronic, prin SmartBill, și se transmit pe adresa de e-mail folosită la comandă.
      </p>

      <h2>7. Reguli de utilizare. Interdicții</h2>
      <p>Este interzis:</p>
      <ul>
        <li>Copierea, distribuirea, revânzarea sau publicarea Conținutului (video, materiale, exerciții).</li>
        <li>Partajarea Contului cu persoane din afara titularului Contului.</li>
        <li>Încercări de a ocoli măsuri tehnice de protecție, de a extrage materiale sau de a automatiza accesul.</li>
        <li>Utilizarea Platformei în scopuri ilegale, defăimătoare sau care afectează securitatea acesteia.</li>
      </ul>
      <p>
        În cazul unor indicii rezonabile de încălcare, accesul poate fi restricționat temporar
        pentru verificări, iar în caz de confirmare, accesul poate fi revocat fără rambursare
        pentru serviciile digitale deja consumate.
      </p>

      <h2>8. Dreptul de retragere / rambursări (OUG 34/2014)</h2>
      <h3>8.1. Cursuri (conținut/servicii digitale)</h3>
      <p>
        Conform art. 16 lit. m) din OUG 34/2014, dreptul de retragere nu se aplică furnizării de
        conținut digital care nu este livrat pe suport material, atunci când furnizarea a
        început cu acordul prealabil expres al consumatorului, care a confirmat totodată că
        își pierde astfel dreptul de retragere. La finalizarea comenzii unui curs, vi se
        solicită acest acord explicit — după confirmarea lui și acordarea accesului, cursul{" "}
        <strong>nu mai poate fi returnat, iar suma nu se rambursează</strong>, cu excepția
        cazurilor de neconformitate dovedită sau eroare tehnică imputabilă Platformei.
      </p>
      <h3>8.2. Cărți (produse fizice)</h3>
      <p>
        Pentru cărți, beneficiați de <strong>dreptul de retragere fără justificare, în termen
        de 14 zile calendaristice</strong> de la data la care intrați (dumneavoastră sau un
        terț desemnat de dumneavoastră) în posesia fizică a produsului, conform OUG 34/2014.
      </p>
      <p>Pentru a vă exercita dreptul de retragere, puteți folosi formularul nostru de retragere: <Link href="/formular-retragere">Formular de retragere</Link>, sau puteți trimite o declarație neechivocă în acest sens la <a href="mailto:office@zecelaexamene.ro">office@zecelaexamene.ro</a>.</p>
      <ul>
        <li>Produsul trebuie returnat în cel mult 14 zile de la comunicarea deciziei de retragere, în aceeași stare, nefolosit, fără deteriorări, în ambalaj adecvat.</li>
        <li>Costul returului este suportat de Client, cu excepția situațiilor în care produsul este neconform sau livrat greșit.</li>
        <li>Rambursarea (inclusiv costul de livrare inițial, la nivelul celei mai ieftine metode oferite) se face în cel mult 14 zile de la data la care suntem informați despre decizia de retragere, dar putem amâna rambursarea până la recepția produsului returnat sau până la primirea unei dovezi de expediere, oricare intervine prima.</li>
      </ul>

      <h2>9. Livrare (cărți)</h2>
      <p>
        Livrarea se face prin curier sau prin rețeaua de easyBox <strong>Sameday</strong>, la
        alegerea făcută în checkout. Termenele estimate de livrare sunt de 1–3 zile lucrătoare;
        în perioade aglomerate pot apărea întârzieri independente de Platformă.
      </p>

      <h2>10. Garanții. Conformitate</h2>
      <p>
        Pentru cărți se aplică garanțiile legale de conformitate. Pentru cursuri, ne angajăm
        să oferim acces conform descrierii publicate, în condiții normale de utilizare
        (browser actualizat, conexiune la internet funcțională).
      </p>

      <h2>11. Proprietate intelectuală</h2>
      <p>
        Întreg Conținutul Platformei este protejat de drepturi de autor și aparține PLATFORMA
        ZECE LA EXAMENE SRL și/sau autorilor colaboratori. Achiziția unui curs sau a unei
        cărți vă acordă un drept limitat, neexclusiv și netransferabil de acces/utilizare
        personală, educațională. Orice copiere, distribuire sau republicare fără acord scris
        este interzisă.
      </p>

      <h2>12. Limitarea răspunderii</h2>
      <p>
        Platforma are scop educațional. Nu garantăm obținerea unei anumite note sau a unui
        anumit rezultat, deoarece performanța depinde de efortul și contextul individual al
        fiecărui elev. În măsura permisă de lege, răspunderea noastră este limitată la
        valoarea sumelor plătite de Client pentru produsul/serviciul în cauză.
      </p>

      <h2>13. Forță majoră</h2>
      <p>
        Nu răspundem pentru neexecutare sau întârziere cauzată de evenimente de forță majoră
        (întreruperi de infrastructură, atacuri cibernetice, decizii ale autorităților,
        calamități naturale etc.).
      </p>

      <h2>14. Modificarea termenilor</h2>
      <p>
        Putem actualiza acești Termeni periodic. Versiunea curentă, cu data ultimei
        actualizări, este întotdeauna publicată pe această pagină.
      </p>

      <h2>15. Protecția datelor</h2>
      <p>
        Prelucrarea datelor personale se face conform{" "}
        <Link href="/politica-confidentialitate">Politicii de Confidențialitate</Link> și{" "}
        <Link href="/politica-cookies">Politicii de Cookies</Link>.
      </p>

      <h2>16. Reclamații. Soluționare alternativă (ANPC / SAL / SOL)</h2>
      <p>
        Pentru orice problemă, încercăm întâi soluționarea amiabilă — scrieți-ne la{" "}
        <a href="mailto:office@zecelaexamene.ro">office@zecelaexamene.ro</a> sau pe WhatsApp la{" "}
        <a href="tel:+40744218696">+40 744 218 696</a>.
      </p>
      <p>Dacă nu se poate soluționa amiabil, aveți dreptul să apelați la:</p>
      <ul>
        <li><a href="https://eservicii.anpc.ro/" target="_blank" rel="noopener noreferrer">A.N.P.C.</a> — Autoritatea Națională pentru Protecția Consumatorilor</li>
        <li><a href="https://reclamatiisal.anpc.ro/" target="_blank" rel="noopener noreferrer">A.N.P.C. — SAL</a> — platforma de Soluționare Alternativă a Litigiilor</li>
        <li><a href="https://consumer-redress.ec.europa.eu/index_ro" target="_blank" rel="noopener noreferrer">SOL</a> — platforma europeană de Soluționare Online a Litigiilor</li>
      </ul>

      <h2>17. Legea aplicabilă</h2>
      <p>
        Acești Termeni sunt guvernați de legea română. Orice litigiu se soluționează de
        instanțele competente din România, fără a afecta drepturile pe care legea le acordă
        consumatorilor.
      </p>

      <h2>18. Contact</h2>
      <CompanyBlock />
    </LegalPage>
  );
}
