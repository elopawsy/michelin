"use client";

import { useRef, useState } from "react";

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

// Statut pneu -> libellé FR + couleur de la bannière.
const STATUTS_PNEU: Record<string, { texte: string; classe: string }> = {
  ok: {
    texte: "Tout est bon",
    classe:
      "border-green-300 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300",
  },
  leak: {
    texte: "Fuite détectée",
    classe:
      "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  },
  low_pressure: {
    texte: "Pneu sous-gonflé",
    classe:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  },
  over_pressure: {
    texte: "Pneu sur-gonflé",
    classe:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  },
  high_temp: {
    texte: "Température élevée",
    classe:
      "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  },
  replace_soon: {
    texte: "À remplacer bientôt",
    classe:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
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
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Capteur de pneu</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Test de connexion Bluetooth (Web Bluetooth API).
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={connecterPneu}
          disabled={statut === "connexion" || statut === "connecté"}
          className="flex h-11 items-center justify-center rounded-full bg-foreground px-6 font-medium text-background transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {statut === "connexion" ? "Connexion…" : "Connecter le pneu"}
        </button>
        {statut === "connecté" && (
          <button
            onClick={deconnecter}
            className="flex h-11 items-center justify-center rounded-full border border-black/15 px-6 font-medium transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Déconnecter
          </button>
        )}
        <Badge statut={statut} />
      </div>

      {appareil && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Appareil : <span className="font-mono">{appareil}</span>
        </p>
      )}

      {erreur && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {erreur}
        </p>
      )}

      {mesure && <StatutPneu code={mesure.st} />}

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Carte
          label="Pression"
          valeur={mesure ? mesure.p.toFixed(2) : "—"}
          unite="bar"
          note={mesure ? `optimal : ${mesure.po.toFixed(2)} bar` : undefined}
        />
        <Carte
          label="Usure"
          valeur={mesure ? mesure.w.toFixed(0) : "—"}
          unite="%"
        />
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
          label="Restant"
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
        <p className="-mt-4 text-xs text-zinc-500">
          Dernière mesure reçue à {mesure.recuLe}
        </p>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-500">Journal</h2>
        <pre className="max-h-64 overflow-auto rounded-lg border border-black/10 bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300">
          {journal.length ? journal.join("\n") : "En attente…"}
        </pre>
      </section>

      <p className="text-xs text-zinc-500">
        Nécessite Chrome ou Edge, sur <span className="font-mono">https://</span>{" "}
        ou <span className="font-mono">localhost</span>. Firefox et Safari ne
        supportent pas le Web Bluetooth.
      </p>
    </main>
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
    <div className="flex flex-col gap-1 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-3xl font-semibold tabular-nums">
        {valeur}
        {unite && (
          <span className="ml-1 text-base font-normal text-zinc-400">
            {unite}
          </span>
        )}
      </span>
      {note && <span className="text-xs text-zinc-400">{note}</span>}
    </div>
  );
}

function StatutPneu({ code }: { code: string }) {
  const s = STATUTS_PNEU[code] ?? {
    texte: code,
    classe:
      "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  };
  return (
    <p
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${s.classe}`}
    >
      {s.texte}
    </p>
  );
}

function Badge({ statut }: { statut: Statut }) {
  const styles: Record<Statut, string> = {
    inactif: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    connexion: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    connecté: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    erreur: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${styles[statut]}`}
    >
      {statut}
    </span>
  );
}

function horodatage() {
  return new Date().toLocaleTimeString("fr-FR");
}
