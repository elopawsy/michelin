# Firmware ESP32 — capteur de pneu Michelin Ride

Firmware BLE pour l'ESP32 qui alimente la page `/pneu` de l'app web (Web Bluetooth).

## Contrat BLE (synchronisé avec `app/pneu/page.tsx`)

| Élément | Valeur |
| --- | --- |
| Service UUID | `4fafc201-1fb5-459e-8fcc-c5c9c331914b` |
| Caractéristique UUID | `beb5483e-36e1-4688-b7f5-ea07361b26a8` (NOTIFY) |
| Nom annoncé | `Michelin Ride` |

Trame JSON envoyée en notification (~1×/s) :

```json
{ "pf": 2.41, "pr": 2.38, "wf": 12, "wr": 18, "v": 31.4, "d": 1280, "bat": 87 }
```

| Clé | Donnée | Unité | Format |
| --- | --- | --- | --- |
| `pf` | pression avant | bar | 2 décimales |
| `pr` | pression arrière | bar | 2 décimales |
| `wf` | usure avant | % | entier |
| `wr` | usure arrière | % | entier |
| `v` | vitesse | km/h | 1 décimale |
| `d` | distance / odomètre | km | entier |
| `bat` | batterie | % | entier |

> ⚠️ Si vous changez une clé ou un UUID ici, modifiez aussi `app/pneu/page.tsx` (constantes `SERVICE`/`CHAR` et interface `Trame`).

## Flasher l'ESP32

1. Installer l'**IDE Arduino**.
2. Ajouter le core ESP32 : _Fichier > Préférences_, URL de gestionnaire de cartes :
   `https://espressif.github.io/arduino-esp32/package_esp32_index.json`,
   puis _Outils > Type de carte > Gestionnaire de cartes_ → installer **esp32** (Espressif).
3. Ouvrir `michelin-ride-esp32/michelin-ride-esp32.ino`.
4. _Outils > Type de carte_ → sélectionner votre modèle (ex. « ESP32 Dev Module »).
5. Brancher la carte en USB, choisir le port, puis **Téléverser**.
6. Ouvrir le **moniteur série** à `115200` bauds pour voir les trames émises.

## Tester la connexion

1. Servir l'app : `pnpm dev` (Web Bluetooth exige **HTTPS** ou `localhost`).
2. Ouvrir `/pneu` dans **Chrome** ou **Edge** (Web Bluetooth non supporté par Firefox/Safari).
3. Cliquer **Connecter le pneu** → choisir `Michelin Ride` → les mesures s'affichent en direct.

## Brancher de vrais capteurs

Le sketch **simule** les données pour valider la chaîne complète. Pour passer
aux vraies mesures, remplacez le bloc marqué `CAPTEUR RÉEL` dans `majMesures()`
par vos lectures (capteur de pression, capteur à effet Hall pour la vitesse,
jauge de carburant/batterie, etc.). Le reste (BLE, notifications, format JSON)
n'a pas besoin de changer.

## Alternative NimBLE (optionnel)

Ce sketch utilise la pile BLE Bluedroid intégrée au core ESP32 (`BLEDevice.h`),
sans dépendance supplémentaire. Pour une empreinte mémoire plus légère, on peut
porter le code sur la bibliothèque **NimBLE-Arduino** (API très proche).
