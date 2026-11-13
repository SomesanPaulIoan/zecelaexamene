import type { Metadata } from "next";
import { Recaptcha } from "@/components/Recaptcha";

export const metadata: Metadata = {
  title: "Contact",
  description: "Ai o întrebare despre cursuri sau cărți? Scrie-ne — îți răspundem cât mai repede.",
};

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5c0-.6.4-1 1-1h3l2 5-2 1.5c.9 2 2.6 3.7 4.5 4.5L14 13l5 2v3c0 .6-.4 1-1 1C10.7 19 4 12.3 4 5Z"
      />
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M13.5 21v-7.5H16l.5-3H13.5V8.2c0-.87.24-1.46 1.5-1.46H16.6V4.14C16.2 4.1 14.9 4 13.4 4c-3 0-5 1.83-5 5.2v2.3H5.9v3h2.5V21h5.1Z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15V9l5.2 3-5.2 3Z" />
    </svg>
  );
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ trimis?: string }>;
}) {
  const { trimis } = await searchParams;

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand via-blue-600 to-indigo-700 py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80">
            Contact
          </span>
          <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">Hai să vorbim!</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Ai o întrebare despre cursuri sau cărți? Scrie-ne — îți răspundem cât mai repede.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-sm font-semibold text-slate-900">Detalii de contact</p>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-blue-50 text-brand">
                  <IconMail />
                </span>
                <div>
                  <p className="text-slate-500">Email</p>
                  <a href="mailto:office@zecelaexamene.ro" className="font-medium text-slate-900 hover:text-brand">
                    office@zecelaexamene.ro
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-blue-50 text-brand">
                  <IconPhone />
                </span>
                <div>
                  <p className="text-slate-500">Telefon / WhatsApp</p>
                  <a href="tel:+40744218696" className="font-medium text-slate-900 hover:text-brand">
                    +40 744 218 696
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-blue-50 text-brand">
                  <IconPin />
                </span>
                <div>
                  <p className="text-slate-500">Adresă</p>
                  <p className="font-medium text-slate-900">
                    Împăratul Traian nr. 27, Bistrița, jud. Bistrița-Năsăud
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-6 flex gap-3 border-t border-slate-200 pt-5 text-slate-400">
              <a
                href="https://www.facebook.com/profile.php?id=100063770423850"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:border-brand hover:text-brand"
              >
                <IconFacebook />
              </a>
              <a
                href="https://www.instagram.com/zece_la_examene/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:border-brand hover:text-brand"
              >
                <IconInstagram />
              </a>
              <a
                href="https://www.youtube.com/@ZeceLaExamene"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:border-brand hover:text-brand"
              >
                <IconYoutube />
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {trimis && (
            <p className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              Mesajul tău a fost trimis! Îți răspundem cât mai curând pe email.
            </p>
          )}

          <form action="/api/contact" method="POST" className="space-y-4 rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nume</label>
              <input
                name="name"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Telefon (WhatsApp)</label>
              <input
                type="tel"
                name="phone"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Mesaj</label>
              <textarea
                name="message"
                required
                rows={6}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none"
              />
            </div>
            <Recaptcha />
            <button
              type="submit"
              className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark sm:w-auto"
            >
              Trimite mesajul
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
