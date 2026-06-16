"use client";

import { useEffect, useState } from "react";
import { Badge, Button, ButtonLink, Picto } from "../_components/ui";
import {
  abonner,
  connecter,
  deconnecter,
  deviceConnecte,
  estAnnulation,
  trameActuelle,
  type Trame,
} from "../_lib/ble";

type Statut = "inactif" | "connexion" | "connecté" | "erreur";

// Une mesure = la trame reçue du capteur, horodatée à la réception.
interface Mesure extends Trame {
  recuLe: string;
}

export function PneuClient() {
  // État initial dérivé de la connexion ouverte à l'étape capteur de
  // l'onboarding : elle survit au router.push (même contexte JS). Si on arrive
  // ici sans être passé par l'onboarding, on reste « inactif » et le bouton
  // ci-dessous permet d'ouvrir la connexion à la main.
  const [statut, setStatut] = useState<Statut>(() =>
    deviceConnecte() ? "connecté" : "inactif",
  );
  const [appareil, setAppareil] = useState<string>(
    () => deviceConnecte()?.name ?? "",
  );
  const [mesure, setMesure] = useState<Mesure | null>(() => {
    const trame = trameActuelle();
    return deviceConnecte() && trame ? { ...trame, recuLe: horodatage() } : null;
  });
  const [erreur, setErreur] = useState<string>("");

  // S'abonne aux mesures en direct et à la perte de connexion.
  useEffect(
    () =>
      abonner(
        (trame) => {
          setStatut("connecté");
          setMesure({ ...trame, recuLe: horodatage() });
        },
        () => setStatut("inactif"),
      ),
    [],
  );

  async function connecterPneu() {
    setErreur("");

    try {
      setStatut("connexion");
      const nom = await connecter();
      setAppareil(nom);
      setStatut("connecté");
    } catch (e) {
      setStatut("erreur");
      const message = e instanceof Error ? e.message : String(e);
      // L'utilisateur qui ferme le sélecteur déclenche une NotFoundError : pas une vraie erreur.
      if (estAnnulation(message)) {
        setStatut("inactif");
        return;
      }
      setErreur(message);
    }
  }

  function deconnecterPneu() {
    deconnecter();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 lg:py-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="max-w-xl">
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] leading-[1.15] font-extrabold tracking-[-0.01em] text-encre italic">
            Capteur de pneu
          </h1>
          <p className="mt-3 text-base leading-[1.6] text-encre-2">
            Connectez votre vélo Michelin Ride en Bluetooth et lisez ses données
            en temps réel&nbsp;: pression et usure de chaque pneu, distance,
            vitesse et batterie.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <div className="flex flex-wrap items-center gap-3">
            {statut === "connecté" ? (
              <Button variant="outline" onClick={deconnecterPneu}>
                Déconnecter
              </Button>
            ) : (
              <Button onClick={connecterPneu} disabled={statut === "connexion"}>
                {statut === "connexion" ? "Connexion…" : "Connecter le pneu"}
              </Button>
            )}
          </div>
          <StatutBadge statut={statut} />
        </div>
      </div>

      {appareil && (
        <p className="mt-5 text-sm text-encre-2">
          Appareil&nbsp;:{" "}
          <span className="font-mono text-encre">{appareil}</span>
        </p>
      )}

      {erreur && (
        <p className="mt-4 rounded-card-sm border border-danger/25 bg-danger-fond px-4 py-3 text-sm font-medium text-danger">
          {erreur}
        </p>
      )}

      {/* Capteur non connecté (étape passée ou déconnexion) : les mesures
          restent vides tant que le Bluetooth n'est pas établi. */}
      {statut === "inactif" && (
        <p className="mt-4 rounded-card-sm border border-warning bg-warning-fond px-4 py-3 text-sm font-medium text-warning-texte">
          Connexion non effectuée — connectez votre capteur en Bluetooth pour
          afficher vos données en temps réel.
        </p>
      )}

      {/* Pneus — pression & usure par pneu (avant / arrière) */}
      <section
        className="mt-8 grid grid-cols-2 gap-4 sm:gap-5"
        aria-label="Pression et usure par pneu"
      >
        <Carte
          label="Pression avant"
          icon="car-tire-pressure"
          valeur={mesure ? mesure.pf.toFixed(2) : "—"}
          unite="bar"
        />
        <Carte
          label="Pression arrière"
          icon="car-tire-pressure"
          valeur={mesure ? mesure.pr.toFixed(2) : "—"}
          unite="bar"
        />
        <Carte
          label="Usure avant"
          icon="tread-durability"
          valeur={mesure ? mesure.wf.toFixed(0) : "—"}
          unite="%"
        />
        <Carte
          label="Usure arrière"
          icon="tread-durability"
          valeur={mesure ? mesure.wr.toFixed(0) : "—"}
          unite="%"
        />
      </section>

      {/* Vélo — mesures globales */}
      <section
        className="mt-4 grid grid-cols-2 gap-4 sm:mt-5 sm:grid-cols-3 sm:gap-5"
        aria-label="Mesures du vélo"
      >
        <Carte
          label="Vitesse"
          icon="speed-rating"
          valeur={mesure ? mesure.v.toFixed(1) : "—"}
          unite="km/h"
        />
        <Carte
          label="Distance"
          icon="mileage"
          valeur={mesure ? mesure.d.toFixed(0) : "—"}
          unite="km"
        />
        <Carte
          label="Batterie"
          icon="battery"
          valeur={mesure ? mesure.bat.toFixed(0) : "—"}
          unite="%"
        />
      </section>
      {mesure && (
        <p className="mt-3 text-xs text-encre-3">
          Dernière mesure reçue à {mesure.recuLe}
        </p>
      )}

      <RecoPub mesure={mesure} />
    </main>
  );
}

function Carte({
  label,
  valeur,
  unite,
  icon,
}: {
  label: string;
  valeur: string;
  unite: string;
  icon?: string;
}) {
  const vide = valeur === "—";
  return (
    <div className="group relative flex min-h-[168px] flex-col overflow-hidden rounded-card border border-bordure bg-carte p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-bleu hover:shadow-card-hover sm:min-h-[188px] sm:p-7">
      {icon && (
        <Picto
          name={icon}
          className="pointer-events-none absolute -bottom-6 -left-6 h-36 w-36 text-bleu/10 transition-transform duration-300 ease-out group-hover:scale-110 sm:h-44 sm:w-44"
        />
      )}
      <p className="relative text-right text-[13px] leading-[18px] font-bold text-encre-2">
        {label}
      </p>
      <p
        className={`relative mt-auto pt-6 text-right text-[2rem] leading-none font-extrabold tabular-nums sm:text-[2.5rem] ${
          vide ? "text-encre-3/40" : "text-encre"
        }`}
      >
        {valeur}
        {unite && (
          <span className="ml-1 align-baseline text-base font-semibold text-encre-3">
            {unite}
          </span>
        )}
      </p>
    </div>
  );
}

// Recommandation pneu en mode pub (DA §11). L'accroche s'adapte au pneu le plus
// usé quand des mesures sont disponibles, sinon message générique.
function RecoPub({ mesure }: { mesure: Mesure | null }) {
  const usureMax = mesure ? Math.max(mesure.wf, mesure.wr) : null;
  const pneuUse = mesure && mesure.wf >= mesure.wr ? "avant" : "arrière";
  const accroche =
    usureMax === null
      ? "Le pneu pensé pour votre profil, prêt à mordre sur tous les terrains."
      : usureMax >= 40
        ? `Votre pneu ${pneuUse} est usé à ${usureMax.toFixed(0)} %. C'est le moment de penser au remplacement.`
        : "Gardez le meilleur grip, kilomètre après kilomètre, avec le pneu fait pour vous.";

  return (
    <section
      aria-label="Recommandation Michelin"
      className="relative mt-10 overflow-hidden rounded-card bg-bleu-fonce p-7 text-white shadow-pneu sm:p-9"
    >
      <Picto
        name="bicycle-tire"
        className="pointer-events-none absolute -right-10 -bottom-10 h-52 w-52 text-white/10 sm:h-64 sm:w-64"
      />
      <div className="relative max-w-md">
        <Badge variant="premium">Recommandé pour vous</Badge>
        <p className="mt-4 text-sm font-semibold text-jaune">Michelin Ride</p>
        <h2 className="mt-1 text-[clamp(1.5rem,3vw,2rem)] leading-[1.1] font-extrabold tracking-[-0.01em] text-white italic">
          Ride Gravel 700 × 42
        </h2>
        <p className="mt-3 text-sm leading-[1.6] text-white/70">{accroche}</p>
        <p className="mt-1 text-sm text-white/50">
          Tubeless · gomme tendre · carcasse souple
        </p>
        <ButtonLink
          href="https://www.michelin.fr/bicycle"
          variant="primary"
          className="mt-6"
          target="_blank"
          rel="noopener noreferrer"
        >
          Découvrir le pneu
        </ButtonLink>
      </div>
    </section>
  );
}

function StatutBadge({ statut }: { statut: Statut }) {
  switch (statut) {
    case "connecté":
      return (
        <Badge variant="connecte">
          <span
            className="pulse-dot h-2 w-2 rounded-full bg-succes"
            aria-hidden="true"
          />
          Connecté
        </Badge>
      );
    case "connexion":
      return <Badge variant="warning">Connexion…</Badge>;
    case "erreur":
      return <Badge variant="danger">Erreur</Badge>;
    default:
      // État inactif (repos) : aucun badge affiché.
      return null;
  }
}

function horodatage() {
  return new Date().toLocaleTimeString("fr-FR");
}
