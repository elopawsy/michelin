"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Badge, Button, Wordmark } from "../_components/ui";

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
const STATUTS_PNEU: Record<string, { texte: string; classe: string }> = {
  ok: {
    texte: "Tout est bon",
    classe: "border-succes/25 bg-succes-fond text-succes",
  },
  leak: {
    texte: "Fuite détectée",
    classe: "border-danger/25 bg-danger-fond text-danger",
  },
  low_pressure: {
    texte: "Pneu sous-gonflé",
    classe: "border-warning bg-warning-fond text-warning-texte",
  },
  over_pressure: {
    texte: "Pneu sur-gonflé",
    classe: "border-warning bg-warning-fond text-warning-texte",
  },
  high_temp: {
    texte: "Température élevée",
    classe: "border-danger/25 bg-danger-fond text-danger",
  },
  replace_soon: {
    texte: "À remplacer bientôt",
    classe: "border-warning bg-warning-fond text-warning-texte",
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
  const [journal, setJournal] = useState<string[]>([]);
  const deviceRef = useRef<BleDevice | null>(null);

  const log = (ligne: string) =>
    setJournal((prev) => [`${horodatage()} ${ligne}`, ...prev].slice(0, 30));

  async function connecterPneu() {
    setErreur("");

    const ble = (navigator as Navigator & { bluetooth?: Ble }).bluetooth;
    if (!ble) {
      setStatut("erreur");
      setErreur(
        "Web Bluetooth indisponible. Utilise Chrome/Edge (pas Firefox/Safari) sur https:// ou localhost.",
      );
      return;
    }

    try {
      setStatut("connexion");
      log("Demande d'appareil…");
      const device = await ble.requestDevice({
        filters: [{ services: [SERVICE] }],
      });
      deviceRef.current = device;
      setAppareil(device.name ?? "(sans nom)");
      log(`Appareil sélectionné : ${device.name ?? "(sans nom)"}`);

      device.addEventListener("gattserverdisconnected", () => {
        setStatut("inactif");
        log("Déconnecté.");
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
          log(`p=${data.p}bar  usure=${data.w}%  v=${data.v}km/h  [${data.st}]`);
        } catch {
          log(`Trame illisible : ${texte}`);
        }
      });

      setStatut("connecté");
      log("Connecté, notifications activées.");
    } catch (e) {
      setStatut("erreur");
      const message = e instanceof Error ? e.message : String(e);
      // L'utilisateur qui ferme le sélecteur déclenche une NotFoundError : pas une vraie erreur.
      if (message.includes("cancelled") || message.includes("User cancelled")) {
        setStatut("inactif");
        log("Sélection annulée.");
        return;
      }
      setErreur(message);
      log(`Erreur : ${message}`);
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
        <p className="text-[13px] leading-[18px] font-bold tracking-[0.18em] text-bleu uppercase">
          Diagnostic en direct
        </p>
        <h1 className="mt-3 text-[clamp(1.875rem,4vw,2.5rem)] leading-[1.15] font-extrabold tracking-[-0.01em] text-encre italic">
          Capteur de pneu
        </h1>
        <p className="mt-3 max-w-xl text-base leading-[1.6] text-encre-2">
          Connectez le pneu Michelin Ride en Bluetooth et lisez ses données en
          temps réel&nbsp;: pression, usure, surface et durée de vie restante.
        </p>

        {/* Connexion */}
        <section className="mt-8 rounded-card border border-bordure bg-carte p-6 shadow-card sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={connecterPneu}
                disabled={statut === "connexion" || statut === "connecté"}
              >
                {statut === "connexion" ? "Connexion…" : "Connecter le pneu"}
              </Button>
              {statut === "connecté" && (
                <Button variant="outline" onClick={deconnecter}>
                  Déconnecter
                </Button>
              )}
            </div>
            <StatutBadge statut={statut} />
          </div>

          {appareil && (
            <p className="mt-4 text-sm text-encre-2">
              Appareil&nbsp;:{" "}
              <span className="font-mono text-encre">{appareil}</span>
            </p>
          )}
        </section>

        {erreur && (
          <p className="mt-4 rounded-card-sm border border-danger/25 bg-danger-fond px-4 py-3 text-sm font-medium text-danger">
            {erreur}
          </p>
        )}

        {mesure && <StatutPneu code={mesure.st} />}

        {/* Mesures */}
        <section
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
          aria-label="Mesures du pneu"
        >
          <Carte
            label="Pression"
            valeur={mesure ? mesure.p.toFixed(2) : "—"}
            unite="bar"
            note={mesure ? `optimal ${mesure.po.toFixed(2)} bar` : undefined}
          />
          <Carte label="Usure" valeur={mesure ? mesure.w.toFixed(0) : "—"} unite="%" />
          <Carte
            label="Vitesse"
            valeur={mesure ? mesure.v.toFixed(1) : "—"}
            unite="km/h"
          />
          <Carte
            label="Temp. pneu"
            valeur={mesure ? mesure.tt.toFixed(1) : "—"}
            unite="°C"
          />
          <Carte
            label="Temp. ambiante"
            valeur={mesure ? mesure.ta.toFixed(1) : "—"}
            unite="°C"
          />
          <Carte
            label="Distance"
            valeur={mesure ? mesure.d.toFixed(0) : "—"}
            unite="km"
          />
          <Carte
            label="Vie restante"
            valeur={mesure ? mesure.rem.toFixed(0) : "—"}
            unite="km"
          />
          <Carte
            label="Résist. roulement"
            valeur={mesure ? mesure.rr.toFixed(1) : "—"}
            unite="W"
          />
          <Carte
            label="Surface"
            valeur={mesure ? (SURFACES[mesure.surf] ?? mesure.surf) : "—"}
            unite=""
          />
          <Carte
            label="Batterie"
            valeur={mesure ? mesure.bat.toFixed(0) : "—"}
            unite="%"
          />
        </section>
        {mesure && (
          <p className="mt-3 text-xs text-encre-3">
            Dernière mesure reçue à {mesure.recuLe}
          </p>
        )}

        {/* Journal */}
        <section className="mt-8 rounded-card border border-bordure bg-carte p-6 shadow-card">
          <h2 className="text-[13px] leading-[18px] font-bold tracking-[0.16em] text-encre-3 uppercase">
            Journal
          </h2>
          <pre className="mt-4 max-h-64 overflow-auto rounded-xs border border-bordure bg-fond p-4 font-mono text-xs leading-relaxed text-encre-2">
            {journal.length ? journal.join("\n") : "En attente…"}
          </pre>
        </section>

        <p className="mt-6 text-[13px] leading-[18px] text-encre-3">
          Nécessite Chrome ou Edge, sur <span className="font-mono">https://</span>{" "}
          ou <span className="font-mono">localhost</span>. Firefox et Safari ne
          supportent pas le Web Bluetooth.
        </p>
      </main>
    </div>
  );
}

function Carte({
  label,
  valeur,
  unite,
  note,
}: {
  label: string;
  valeur: string;
  unite: string;
  note?: string;
}) {
  return (
    <div className="rounded-card-sm border border-bordure bg-carte p-5 shadow-card">
      <p className="text-[13px] leading-[18px] font-bold text-encre-2">{label}</p>
      <p className="mt-2 text-[2rem] leading-[1.1] font-extrabold text-encre tabular-nums sm:text-[2.5rem]">
        {valeur}
        {unite && (
          <span className="ml-1 align-baseline text-base font-semibold text-encre-3">
            {unite}
          </span>
        )}
      </p>
      {note && <p className="mt-1 text-xs text-encre-3">{note}</p>}
    </div>
  );
}

function StatutPneu({ code }: { code: string }) {
  const s = STATUTS_PNEU[code] ?? {
    texte: code,
    classe: "border-bordure bg-bleu-leger text-encre-2",
  };
  return (
    <p
      className={`mt-6 rounded-card-sm border px-4 py-3 text-sm font-bold ${s.classe}`}
    >
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
      return <Badge variant="neutre">Inactif</Badge>;
  }
}

function horodatage() {
  return new Date().toLocaleTimeString("fr-FR");
}
