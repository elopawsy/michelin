import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

// Police unique du design system : Noto Sans (poids 400 → 800).
const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["400", "500", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_DESCRIPTION =
  "Michelin Ride, la gamme de pneus vélo gravel haut de gamme de Michelin. " +
  "Héritage du pneu démontable depuis 1891 et premier pneu connecté : " +
  "pression, usure et surface en temps réel.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Michelin Ride — Le gravel, par-delà le bitume",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "fr_FR",
    url: SITE_URL,
    title: "Michelin Ride — Le gravel, par-delà le bitume",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Michelin Ride — Le gravel, par-delà le bitume",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${notoSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Sans JavaScript, on garde tout le contenu visible. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>[data-reveal]{opacity:1!important;transform:none!important}</style>",
          }}
        />
        {children}
      </body>
    </html>
  );
}
