import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
const SITE_DESCRIPTION =
  "Cursuri video și cărți de pregătire pentru Bacalaureat și admitere la facultate — Matematică, Limba Română, Istorie, Biologie și Informatică, create de profesori care au ajutat deja mii de elevi.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zece la Examene — Cursuri și cărți pentru Bacalaureat și Admitere",
    template: "%s | Zece la Examene",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: "Zece la Examene",
    type: "website",
    locale: "ro_RO",
    url: SITE_URL,
    title: "Zece la Examene — Cursuri și cărți pentru Bacalaureat și Admitere",
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.png", width: 2100, height: 600, alt: "Zece la Examene" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zece la Examene",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zece la Examene",
  legalName: "PLATFORMA ZECE LA EXAMENE SRL",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Împăratul Traian nr. 27",
    addressLocality: "Bistrița",
    addressRegion: "Bistrița-Năsăud",
    postalCode: "420145",
    addressCountry: "RO",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+40744218696",
    contactType: "customer service",
    email: "office@zecelaexamene.ro",
  },
  sameAs: [
    "https://www.facebook.com/profile.php?id=100063770423850",
    "https://www.instagram.com/zece_la_examene/",
    "https://www.youtube.com/@ZeceLaExamene",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
