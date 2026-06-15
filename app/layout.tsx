import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

// Police unique du design system : Noto Sans (poids 400 → 800).
const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Michelin Ride — Le gravel, par-delà le bitume",
  description:
    "Michelin Ride, la gamme de pneus vélo gravel haut de gamme de Michelin. " +
    "Héritage du pneu démontable depuis 1891 et premier pneu connecté : " +
    "pression, usure et surface en temps réel.",
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
