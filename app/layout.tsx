import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import { PwaRegistration } from "@/app/_components/PwaRegistration";
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
  applicationName: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.webmanifest",
  title: {
    default: "Michelin Ride — Le gravel, par-delà le bitume",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Michelin Ride",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: [{ url: "/pwa/apple-touch-icon.png", sizes: "180x180" }],
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
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

export const viewport: Viewport = {
  themeColor: "#00205b",
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
        <PwaRegistration />
      </body>
    </html>
  );
}
