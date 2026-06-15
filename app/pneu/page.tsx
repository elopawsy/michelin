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

interface Mesure {
  pression: number;
  usure: number;
  recuLe: string;
}

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
          const data = JSON.parse(texte) as { p: number; u: number };
          setMesure({ pression: data.p, usure: data.u, recuLe: horodatage() });
          log(`pression=${data.p}  usure=${data.u}`);
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

      <section className="grid grid-cols-2 gap-4">
        <Carte
          label="Pression"
          valeur={mesure ? `${mesure.pression}` : "—"}
          unite="bar"
        />
        <Carte
          label="Usure"
          valeur={mesure ? `${mesure.usure}` : "—"}
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
}: {
  label: string;
  valeur: string;
  unite: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-3xl font-semibold tabular-nums">
        {valeur}
        <span className="ml-1 text-base font-normal text-zinc-400">{unite}</span>
      </span>
    </div>
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
