import Link from "next/link";
import { getCurrentUserSummary } from "@/lib/current-session";
import { HeaderUserBadge } from "../_components/HeaderUserBadge";
import { Wordmark } from "../_components/ui";
import { PneuClient } from "./PneuClient";

export default async function PneuPage() {
  const user = await getCurrentUserSummary();

  return (
    <div className="flex min-h-full flex-col bg-fond text-encre">
      <header className="sticky top-0 z-40 border-b border-bordure bg-carte/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" aria-label="Michelin Ride — accueil">
            <Wordmark />
          </Link>
          <nav className="flex items-center gap-7" aria-label="Navigation">
            <Link
              href="/"
              className="text-sm font-medium text-encre-2 transition-colors hover:text-encre"
            >
              Accueil
            </Link>
            <Link
              href="/#gamme"
              className="hidden text-sm font-medium text-encre-2 transition-colors hover:text-encre sm:block"
            >
              La gamme
            </Link>
            {user ? (
              <HeaderUserBadge user={user} variant="app" />
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-encre-2 transition-colors hover:text-encre"
              >
                Connexion
              </Link>
            )}
          </nav>
        </div>
      </header>

      <PneuClient />
    </div>
  );
}
