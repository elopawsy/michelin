"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Badge, Button, Picto, Wordmark } from "../_components/ui";

const SERVICE = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"; // en minuscules !
const CHAR = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

// Le Web Bluetooth n'est pas inclus dans lib.dom.d.ts : on déclare le minimum
// dont on se sert ici pour rester typé sans `any`.
interface BleCharacteristic {
  startNotifications(): Promise<BleCharacteristic>;
  addEventListener(
    type: "characteristicvaluechanged",
    listener: (event: Event) => void,
  ): void;
}
interface BleService {
  getCharacteristic(uuid: string): Promise<BleCharacteristic>;
}
interface BleServer {
  getPrimaryService(uuid: string): Promise<BleService>;
}
interface BleDevice {
  name?: string;
  gatt?: { connect(): Promise<BleServer>; disconnect(): void };
  addEventListener(type: "gattserverdisconnected", listener: () => void): void;
}
interface Ble {
  requestDevice(options: {
    filters: { services: string[] }[];
  }): Promise<BleDevice>;
}

type Statut = "inactif" | "connexion" | "connecté" | "erreur";

// Trame JSON émise par le firmware ESP32 (clés courtes pour tenir dans le MTU).
interface Trame {
  p: number; // pression (bar)
  po: number; // pression optimale (bar)
  tt: number; // température pneu (°C)
  ta: number; // température ambiante (°C)
  v: number; // vitesse (km/h)
  d: number; // distance / odomètre (km)
  w: number; // usure (%)
  rem: number; // durée de vie restante (km)
  rr: number; // résistance au roulement (W)
  surf: string; // surface : tarmac | gravel | rough
  st: string; // statut : ok | leak | low_pressure | over_pressure | high_temp | replace_soon
  bat: number; // batterie (%)
}

interface Mesure extends Trame {
  recuLe: string;
}

// Statut pneu -> libellé FR + couleur de la bannière (DA §5 États).
const STATUTS_PNEU: Record<
  string,
  { texte: string; classe: string; icon: string }
> = {
  ok: {
    texte: "Tout est bon",
    classe: "border-succes/25 bg-succes-fond text-succes",
    icon: "security",
  },
  leak: {
    texte: "Fuite détectée",
    classe: "border-danger/25 bg-danger-fond text-danger",
    icon: "assistance",
  },
  low_pressure: {
    texte: "Pneu sous-gonflé",
    classe: "border-warning bg-warning-fond text-warning-texte",
    icon: "car-tire-pressure",
  },
  over_pressure: {
    texte: "Pneu sur-gonflé",
    classe: "border-warning bg-warning-fond text-warning-texte",
    icon: "car-tire-pressure",
  },
  high_temp: {
    texte: "Température élevée",
    classe: "border-danger/25 bg-danger-fond text-danger",
    icon: "assistance",
  },
  replace_soon: {
    texte: "À remplacer bientôt",
    classe: "border-warning bg-warning-fond text-warning-texte",
    icon: "inspect-tire-side",
  },
};

const SURFACES: Record<string, string> = {
  tarmac: "Route",
  gravel: "Gravel",
  rough: "Chemin",
};

export default function PneuPage() {
  const [statut, setStatut] = useState<Statut>("inactif");
  const [appareil, setAppareil] = useState<string>("");
  const [mesure, setMesure] = useState<Mesure | null>(null);
  const [erreur, setErreur] = useState<string>("");
  const deviceRef = useRef<BleDevice | null>(null);

  async function connecterPneu() {
    setErreur("");

    const ble = (navigator as Navigator & { bluetooth?: Ble }).bluetooth;
    if (!ble) {
      setStatut("erreur");
      setErreur(
        "La connexion Bluetooth n'est pas disponible sur ce navigateur. Essayez avec Chrome ou Edge.",
      );
      return;
    }

    try {
      setStatut("connexion");
      const device = await ble.requestDevice({
        filters: [{ services: [SERVICE] }],
      });
      deviceRef.current = device;
      setAppareil(device.name ?? "(sans nom)");

      device.addEventListener("gattserverdisconnected", () => {
        setStatut("inactif");
      });

      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(SERVICE);
      const char = await service.getCharacteristic(CHAR);
      await char.startNotifications();

      char.addEventListener("characteristicvaluechanged", (event) => {
        const value = (event.target as unknown as { value?: DataView }).value;
        if (!value) return;
        const texte = new TextDecoder().decode(value);
        try {
          const data = JSON.parse(texte) as Trame;
          setMesure({ ...data, recuLe: horodatage() });
        } catch {
          // Trame illisible : on ignore.
        }
      });

      setStatut("connecté");
    } catch (e) {
      setStatut("erreur");
      const message = e instanceof Error ? e.message : String(e);
      // L'utilisateur qui ferme le sélecteur déclenche une NotFoundError : pas une vraie erreur.
      if (message.includes("cancelled") || message.includes("User cancelled")) {
        setStatut("inactif");
        return;
      }
      setErreur(message);
    }
  }

  function deconnecter() {
    deviceRef.current?.gatt?.disconnect();
  }

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
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 lg:py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="max-w-xl">
            <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] leading-[1.15] font-extrabold tracking-[-0.01em] text-encre italic">
              Capteur de pneu
            </h1>
            <p className="mt-3 text-base leading-[1.6] text-encre-2">
              Connectez le pneu Michelin Ride en Bluetooth et lisez ses données
              en temps réel&nbsp;: pression, usure, surface et durée de vie
              restante.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
            <div className="flex flex-wrap items-center gap-3">
              {statut === "connecté" && (
                <Button variant="outline" onClick={deconnecter}>
                  Déconnecter
                </Button>
              )}
              <Button
                onClick={connecterPneu}
                disabled={statut === "connexion" || statut === "connecté"}
              >
                {statut === "connexion" ? "Connexion…" : "Connecter le pneu"}
              </Button>
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

        {mesure && <StatutPneu code={mesure.st} />}

        {/* Mesures */}
        <section
          className="mt-8 grid grid-cols-2 gap-4 sm:gap-5"
          aria-label="Mesures du pneu"
        >
          <Carte
            label="Pression"
            icon="car-tire-pressure"
            valeur={mesure ? mesure.p.toFixed(2) : "—"}
            unite="bar"
            note={mesure ? `optimal ${mesure.po.toFixed(2)} bar` : undefined}
          />
          <Carte
            label="Usure"
            icon="tread-durability"
            valeur={mesure ? mesure.w.toFixed(0) : "—"}
            unite="%"
          />
          <Carte
            label="Vitesse"
            icon="speed-rating"
            valeur={mesure ? mesure.v.toFixed(1) : "—"}
            unite="km/h"
          />
          <Carte
            label="Temp. pneu"
            icon="temperature"
            valeur={mesure ? mesure.tt.toFixed(1) : "—"}
            unite="°C"
          />
          <Carte
            label="Temp. ambiante"
            icon="temperature"
            valeur={mesure ? mesure.ta.toFixed(1) : "—"}
            unite="°C"
          />
          <Carte
            label="Distance"
            icon="mileage"
            valeur={mesure ? mesure.d.toFixed(0) : "—"}
            unite="km"
          />
          <Carte
            label="Vie restante"
            icon="tread-life"
            valeur={mesure ? mesure.rem.toFixed(0) : "—"}
            unite="km"
          />
          <Carte
            label="Résist. roulement"
            icon="energy-efficiency"
            valeur={mesure ? mesure.rr.toFixed(1) : "—"}
            unite="W"
          />
          <Carte
            label="Surface"
            icon="traction"
            valeur={mesure ? (SURFACES[mesure.surf] ?? mesure.surf) : "—"}
            unite=""
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
      </main>
    </div>
  );
}

function Carte({
  label,
  valeur,
  unite,
  note,
  icon,
}: {
  label: string;
  valeur: string;
  unite: string;
  note?: string;
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
      {note && <p className="relative mt-1.5 text-right text-xs text-encre-3">{note}</p>}
    </div>
  );
}

function StatutPneu({ code }: { code: string }) {
  const s = STATUTS_PNEU[code] ?? {
    texte: code,
    classe: "border-bordure bg-bleu-leger text-encre-2",
    icon: "inspect-tire-side",
  };
  return (
    <p
      className={`mt-6 flex items-center gap-2.5 rounded-card-sm border px-4 py-3 text-sm font-bold ${s.classe}`}
    >
      <Picto name={s.icon} className="h-5 w-5" />
      {s.texte}
    </p>
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
