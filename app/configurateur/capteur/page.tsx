"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, BackLink, Wordmark } from "../../_components/ui";
import { connecter, estAnnulation } from "../../_lib/ble";

const STEP = 5;
const TOTAL = 6;

export default function CapteurPage() {
  const router = useRouter();
  const [connexion, setConnexion] = useState(false);
  const [erreur, setErreur] = useState("");

  async function connecterCapteur() {
    setErreur("");

    try {
      setConnexion(true);
      // Ouvre la connexion partagée : le dashboard /pneu la réutilisera tel quel,
      // sans redemander le sélecteur ni reconnecter.
      await connecter();
      router.push("/pneu");
    } catch (e) {
      setConnexion(false);
      const message = e instanceof Error ? e.message : String(e);
      if (estAnnulation(message)) return; // sélecteur fermé : on reste sur l'étape.
      setErreur(message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fond p-4 sm:p-6">
      <section className="flex w-full max-w-[900px] flex-col rounded-[28px] bg-carte p-6 shadow-panel sm:p-9">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BackLink href="/configurateur/kilometres" />
            <Wordmark className="h-9 sm:h-11" />
          </div>
          <span className="text-sm font-semibold text-encre-2">
            Étape {STEP} / {TOTAL}
          </span>
        </div>

        <div className="mt-6 flex gap-2.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < STEP ? "bg-jaune" : "bg-bordure"}`}
            />
          ))}
        </div>

        <h1 className="mt-8 text-center text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.01em] text-bleu-fonce">
          Capteur de pneu
        </h1>
        <p className="mt-2 text-center text-base font-medium text-bleu">
          Connexion Bluetooth
        </p>

        <div className="mx-auto mt-6 w-full max-w-[420px]">
          <Image
            src="/capteur.png"
            alt="Capteur de pneu Michelin"
            width={1254}
            height={1254}
            priority
            className="h-auto w-full"
          />
        </div>

        {erreur && (
          <p className="mt-2 rounded-card-sm border border-danger/25 bg-danger-fond px-4 py-3 text-center text-sm font-medium text-danger">
            {erreur}
          </p>
        )}

        <button
          type="button"
          onClick={connecterCapteur}
          disabled={connexion}
          className="group relative mt-6 inline-flex h-[56px] w-full items-center justify-center rounded-full bg-jaune px-9 text-base font-bold text-bleu-fonce shadow-cta transition duration-200 hover:-translate-y-px hover:bg-jaune-hover active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-texte disabled:shadow-none disabled:hover:translate-y-0"
        >
          {connexion ? "Connexion…" : "Connecter le pneu"}
          <ArrowRight className="absolute right-7 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        {/* Échappatoire : si l'appairage Bluetooth n'est pas possible
            (navigateur non compatible, pas de capteur…), on rejoint quand même
            le tableau de bord — qui affichera la bannière « connexion non
            effectuée ». */}
        <button
          type="button"
          onClick={() => router.push("/pneu")}
          disabled={connexion}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold text-encre-2 transition-colors hover:text-encre disabled:cursor-not-allowed disabled:opacity-50"
        >
          Passer sans connecter
        </button>
      </section>
    </div>
  );
}
