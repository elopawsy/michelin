import type { Metadata } from "next";
import { MichelinHeader } from "../_components/MichelinHeader";
import { JeuExperience } from "../_components/jeu/JeuExperience";
import { getCurrentUserSummary } from "@/lib/current-session";

export const metadata: Metadata = {
  title: "Michelin Ride — La Côte · le jeu",
  description:
    "Pédalez le plus loin possible en gravel, ramassez des pièces et débloquez toute la gamme de pneus Michelin. Un Hill-Climb aux couleurs de Michelin Ride.",
};

export default async function JeuPage() {
  const summary = await getCurrentUserSummary();
  const user = summary
    ? { id: summary.id, displayName: summary.displayName }
    : null;

  return (
    <div className="flex min-h-full flex-col bg-fond text-encre">
      <MichelinHeader />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-8 lg:px-12 lg:py-10">
        <div className="mb-6 max-w-2xl">
          <p className="text-[13px] font-bold tracking-[0.18em] text-bleu uppercase">
            Le jeu
          </p>
          <h1 className="mt-2 text-[clamp(1.875rem,4vw,2.75rem)] leading-[1.1] font-extrabold tracking-[-0.01em] text-encre italic">
            La Côte
          </h1>
          <p className="mt-3 text-base leading-[1.6] text-encre-2">
            Pédalez le plus loin possible en gravel, ramassez des pièces et
            gagnez de quoi débloquer toute la gamme de pneus Michelin — du City
            Durable au Ride&nbsp;Gravel 700&nbsp;×&nbsp;42 connecté.
          </p>
        </div>
        <JeuExperience user={user} />
      </main>
    </div>
  );
}
