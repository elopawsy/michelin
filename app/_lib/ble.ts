// Web Bluetooth — partagé entre l'étape capteur (/configurateur/capteur) et le
// dashboard (/pneu). Le Web Bluetooth n'est pas inclus dans lib.dom.d.ts : on
// déclare ici le minimum dont on se sert, pour rester typé sans `any`.

export const SERVICE = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"; // en minuscules !
export const CHAR = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

export const MSG_BLUETOOTH_INDISPONIBLE =
  "La connexion Bluetooth n'est pas disponible sur ce navigateur. Essayez avec Chrome ou Edge.";

export interface BleCharacteristic {
  startNotifications(): Promise<BleCharacteristic>;
  addEventListener(
    type: "characteristicvaluechanged",
    listener: (event: Event) => void,
  ): void;
}
export interface BleService {
  getCharacteristic(uuid: string): Promise<BleCharacteristic>;
}
export interface BleServer {
  getPrimaryService(uuid: string): Promise<BleService>;
}
export interface BleDevice {
  name?: string;
  gatt?: {
    connected: boolean;
    connect(): Promise<BleServer>;
    disconnect(): void;
  };
  addEventListener(type: "gattserverdisconnected", listener: () => void): void;
}
export interface Ble {
  requestDevice(options: {
    filters: { services: string[] }[];
  }): Promise<BleDevice>;
}

// Renvoie l'API Web Bluetooth si le navigateur la supporte (Chrome / Edge),
// sinon null. Sûr à appeler côté serveur (navigator absent).
export function getBle(): Ble | null {
  if (typeof navigator === "undefined") return null;
  return (navigator as Navigator & { bluetooth?: Ble }).bluetooth ?? null;
}

// L'utilisateur qui ferme le sélecteur d'appareils déclenche une annulation :
// ce n'est pas une vraie erreur à afficher.
export function estAnnulation(message: string): boolean {
  return message.includes("cancelled") || message.includes("User cancelled");
}

// Trame JSON émise par le firmware ESP32 (clés courtes pour tenir dans le MTU).
// Le vélo a deux pneus : pression et usure sont donc dédoublées avant / arrière.
export interface Trame {
  pf: number; // pression avant (bar)
  pr: number; // pression arrière (bar)
  wf: number; // usure avant (%)
  wr: number; // usure arrière (%)
  v: number; // vitesse (km/h)
  d: number; // distance / odomètre (km)
  bat: number; // batterie (%)
}

// --- Connexion partagée -----------------------------------------------------
// La navigation App Router (router.push) ne recharge pas la page : le même
// contexte JS persiste d'une route à l'autre. On garde donc la connexion BLE
// vivante ici, pour que l'étape capteur de l'onboarding l'ouvre une fois et que
// le dashboard /pneu la réutilise — sans redemander le sélecteur d'appareils.

type EcouteurTrame = (trame: Trame) => void;
type EcouteurDeconnexion = () => void;

let deviceActif: BleDevice | null = null;
let derniereTrame: Trame | null = null;
const ecouteursTrame = new Set<EcouteurTrame>();
const ecouteursDeconnexion = new Set<EcouteurDeconnexion>();

// Connexion réellement établie (et toujours vivante) ?
export function deviceConnecte(): BleDevice | null {
  return deviceActif?.gatt?.connected ? deviceActif : null;
}

export function trameActuelle(): Trame | null {
  return derniereTrame;
}

// S'abonner aux mesures et à la perte de connexion. Renvoie une fonction de
// désabonnement à appeler au démontage du composant.
export function abonner(
  onTrame: EcouteurTrame,
  onDeconnexion?: EcouteurDeconnexion,
): () => void {
  ecouteursTrame.add(onTrame);
  if (onDeconnexion) ecouteursDeconnexion.add(onDeconnexion);
  return () => {
    ecouteursTrame.delete(onTrame);
    if (onDeconnexion) ecouteursDeconnexion.delete(onDeconnexion);
  };
}

// Ouvre le sélecteur, connecte le GATT, s'abonne aux notifications et mémorise
// la connexion pour les autres pages. À appeler depuis un clic utilisateur
// (contrainte Web Bluetooth). Renvoie le nom de l'appareil.
export async function connecter(): Promise<string> {
  const ble = getBle();
  if (!ble) throw new Error(MSG_BLUETOOTH_INDISPONIBLE);

  const device = await ble.requestDevice({
    filters: [{ services: [SERVICE] }],
  });

  device.addEventListener("gattserverdisconnected", () => {
    if (deviceActif !== device) return; // une connexion plus récente a pris le relais
    deviceActif = null;
    derniereTrame = null;
    ecouteursDeconnexion.forEach((fn) => fn());
  });

  const server = await device.gatt!.connect();
  const service = await server.getPrimaryService(SERVICE);
  const char = await service.getCharacteristic(CHAR);
  await char.startNotifications();

  char.addEventListener("characteristicvaluechanged", (event) => {
    const value = (event.target as unknown as { value?: DataView }).value;
    if (!value) return;
    try {
      const trame = JSON.parse(new TextDecoder().decode(value)) as Trame;
      derniereTrame = trame;
      ecouteursTrame.forEach((fn) => fn(trame));
    } catch {
      // Trame illisible : on ignore.
    }
  });

  deviceActif = device;
  return device.name ?? "(sans nom)";
}

export function deconnecter(): void {
  deviceActif?.gatt?.disconnect();
}
