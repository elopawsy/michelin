# Michelin Ride

> **Le gravel, par-delà le bitume.** — _La vie est meilleure en mouvement._

Application web vitrine d'une gamme de pneus vélo **gravel haut de gamme Michelin**, autour d'un concept : l'héritage du pneu démontable (1891) rencontre le **premier pneu connecté** (pression, usure et surface en temps réel via capteur ESP32 + Web Bluetooth).

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node](https://img.shields.io/badge/Node-22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11.3.0-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Licence](https://img.shields.io/badge/licence-propri%C3%A9taire-red)](./LICENSE)
[![Statut](https://img.shields.io/badge/statut-en%20ligne-success)](https://michelin.doublepoints3.com)

**🔗 En ligne : [michelin.doublepoints3.com](https://michelin.doublepoints3.com)**

<!-- Galerie de mockups — ajoute simplement tes images dans public/readme/
     puis duplique une cellule <td>…</td> (ou ajoute une ligne <tr>) ci-dessous. -->
<table align="center">
  <tr>
    <td align="center" width="50%">
      <img src="./public/readme/Mockup_accueil.png" alt="Écran d'accueil — Michelin Ride" width="400" /><br/>
      <sub><b>Accueil</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="./public/readme/mOCKUP_RECOMMANDATION.png" alt="Écran de recommandations — Michelin Ride" width="400" /><br/>
      <sub><b>Recommandations</b></sub>
    </td>
  </tr>
</table>

> 💡 Les écrans dynamiques (connexion BLE temps réel sur `/pneu`, mini-jeu « La Côte », configurateur 8 étapes) rendent mieux en mouvement : un GIF de démonstration les valorisera davantage qu'une capture statique.

---

## Table des matières

- [Le concept](#-le-concept)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture du projet](#️-architecture-du-projet)
- [Démarrage rapide](#-démarrage-rapide)
- [Base de données](#️-base-de-données)
- [Pneu connecté & firmware ESP32](#-pneu-connecté--firmware-esp32)
- [Mini-jeu « La Côte »](#-mini-jeu--la-côte-)
- [Tests & qualité](#-tests--qualité)
- [Déploiement & CI/CD](#-déploiement--cicd)
- [API — repères](#-api--repères)
- [Limitations connues](#-limitations-connues)
- [Dépannage BLE](#-dépannage-ble)
- [Contribution](#-contribution)
- [Licence](#-licence)
- [Crédits & contexte](#-crédits--contexte)

---

## ✨ Le concept

En 1891, Michelin invente le pneu démontable et change la pratique du vélo. **Michelin Ride** prolonge cet héritage en l'amenant sur le terrain du **gravel**, là où la route s'arrête.

Le fil rouge du projet est le **pneu connecté** : un capteur embarqué (ESP32) mesure en continu la **pression**, l'**usure** et la **surface** roulée, et diffuse ces données en **Bluetooth** vers l'application web. Le cycliste visualise l'état de ses pneus en temps réel, reçoit des **recommandations de roues** adaptées à son usage, explore un **catalogue** complet, planifie ses sorties chez des **revendeurs** géolocalisés, lit le magazine éditorial **« Le Mag »**, et peut même débloquer toute la gamme dans le mini-jeu **« La Côte »**.

Le tout s'articule autour d'un récit cohérent : *du pneu démontable au pneu qui parle.*

---

## 🚀 Fonctionnalités

### Vitrine & contenu

| Route | Rôle |
| --- | --- |
| `/` | Accueil : hero pleine largeur (Bibendum), CTA conditionnel (`/heritage` si connecté, sinon `/register`) |
| `/heritage` | L'héritage Michelin (1891), 3 cartes scrollables, CTA vers le configurateur |
| `/a-propos` | Mission, chiffres clés, 3 valeurs, frise chronologique (1889 / 1891 / 1946 / 2024) |
| `/design-system` | One-pager marketing complet (Héritage, pneu connecté avec dashboard live animé, gamme, témoignage) |
| `/catalogue` | **79 modèles** filtrables par catégorie, toggle tubeless, recherche texte |
| `/revendeurs` | Carte Leaflet interactive + planificateur de parcours, **15 revendeurs** en ligne groupés par région/pays |
| `/blog`, `/blog/[slug]` | « Le Mag » : hub éditorial + **6 articles** (SSG, JSON-LD Article/BreadcrumbList/FAQPage) |
| `/faq` | FAQ en accordéon (contenu statique) |

Le catalogue se répartit en **Enfant (2), Gravel (4), Route (12), Ville & rando (13), VTT (48)**. Les 6 slugs d'articles : `pneu-velo-connecte` (à la une), `pression-pneus-gravel-guide`, `choisir-largeur-pneus-gravel`, `technologie-gomme-adherence-rendement`, `technologies-anti-crevaison`, `tubeless-ou-chambre-a-air`.

### Configurateur & recommandations

| Route | Rôle |
| --- | --- |
| `/configurateur` (+ `modele`, `terrain`, `usage`, `priorites`, `kilometres`, `details`, `capteur`) | Assistant en **8 étapes**, état persisté en `localStorage`, reprise possible |
| `/recommandations` | Liste des recommandations générées + résumé de la dernière config |
| `/recommandations/[id]` | Détail d'une reco : métriques pneu + offres de magasins partenaires |

- **8 étapes** : `type → modele → terrain → usage → priorites → kilometres → details → capteur`.
- Validation par étape **et** revalidation complète côté serveur avant soumission.
- Sliders de priorités **Vitesse / Confort / Durabilité** (1–10, défaut **6**).
- À la soumission : création d'un `UserBicycle` + `UserPreference` en transaction, puis génération de **jusqu'à 3 recommandations** scorées.
- Moteur de scoring 0–100 pondéré : **préférences 50 %, objectif 20 %, surface 15 %, compatibilité 15 %**, plus un **bonus capteur** (jusqu'à +10) qui pousse les roues plus durables quand le pneu mesuré est usé.

**Repères du moteur** : `surfaceScore` = 100 si la surface correspond, sinon 70 · `goalScore` par défaut 5/10 si aucun lien d'objectif · priorité par défaut 6 (plage 1–10). Bornes de validation serveur : `tireWidthMm` 20–75 mm, `weeklyDistanceKm` 1–500, `wheelSize` ∈ {`700c`, `29`}, `brakeType` ∈ {`disc`, `rim`}.

### Pneu connecté (Web Bluetooth)

| Route | Rôle |
| --- | --- |
| `/pneu` | UI temps réel BLE : connexion en un clic, cartes live, 5 graphes d'historique, sauvegarde auto |

- Connexion **Web Bluetooth** en un clic (« Connecter le pneu »).
- Lecture temps réel : pression avant/arrière, usure avant/arrière, vitesse, distance, batterie.
- Enregistrement automatique d'une mesure **toutes les 60 s** ; historique plafonné à **120 points** et tracé via 5 graphes SVG faits main.
- Connexion BLE **partagée** entre l'étape capteur du configurateur et `/pneu` (singleton module-scope, pas de re-sélection d'appareil).

### Mini-jeu « La Côte »

| Route | Rôle |
| --- | --- |
| `/jeu` | Hill-Climb 2D canvas : rouler le plus loin, ramasser des pièces, débloquer la gamme |

Boucle de jeu à pas fixe (60 Hz) hors de React, terrain procédural infini déterministe, progression persistée en `localStorage` et meilleur score mirroré côté serveur pour un **classement public**.

### Compte & API

| Route | Rôle |
| --- | --- |
| `/(auth)/login`, `/(auth)/register` | Authentification (JWT maison) |
| `/profil` | Édition du profil + déconnexion |

- Auth **JWT maison** (HMAC-SHA256, sans librairie), mots de passe hashés en **scrypt**, session en cookie `httpOnly` (TTL 7 jours).
- API REST **CRUD générique** sur 16 ressources + handlers spéciaux (dashboard, recommandations, lectures capteur, classement).

---

## 🧱 Stack technique

| Domaine | Technologie |
| --- | --- |
| Framework | Next.js **16.2.9** (App Router, React Server Components) |
| UI | React **19.2.4**, TypeScript **5** |
| Styles | Tailwind CSS **v4** (tokens via `@theme` dans `globals.css`, sans config JS) |
| Police | **Noto Sans** (`next/font/google`) |
| ORM | Prisma **7.8** (generator `prisma-client` → `generated/prisma`, adapter `@prisma/adapter-pg`) |
| Base de données | PostgreSQL **17** |
| Auth | JWT maison HMAC-SHA256, mots de passe scrypt |
| Tests | Vitest **4** |
| Qualité | ESLint **9** (flat config) |
| Gestionnaire de paquets | pnpm **11.3.0** |
| Runtime | Node **22** |
| Firmware capteur | Arduino / ESP32 (core `esp32`, BLE Bluedroid) |
| Cartographie | Leaflet 1.9.4 (CDN) + API de routage BRouter |

> ℹ️ **Cette version de Next.js comporte des _breaking changes_** par rapport aux versions antérieures (cf. `AGENTS.md`). Consulter les guides dans `node_modules/next/dist/docs/` avant d'écrire du code.

---

## 🗂️ Architecture du projet

```
michelin/
├── app/                          # App Router (RSC + îlots client)
│   ├── layout.tsx                # RootLayout, metadata globale, Noto Sans
│   ├── page.tsx                  # Accueil (hero Bibendum, CTA conditionnel)
│   ├── globals.css               # Design tokens Tailwind v4 (@theme)
│   ├── sitemap.ts / robots.ts    # SEO (sitemap = / + /blog ; disallow /api,/login,/register)
│   ├── _components/              # Header partagé, UI, jeu (engine, store, écrans)
│   ├── _lib/ble.ts               # Pile Web Bluetooth + singleton de connexion
│   ├── heritage/ a-propos/ faq/  # Pages éditoriales statiques
│   ├── design-system/            # One-pager marketing
│   ├── catalogue/                # CatalogueClient + _data/catalogue.generated.ts (GÉNÉRÉ)
│   ├── revendeurs/               # DealerMap (Leaflet/BRouter) + _data/dealers.ts
│   ├── blog/                     # Hub + [slug] SSG + _data (types, articles)
│   ├── configurateur/            # 8 étapes (wrappers fins → ConfiguratorStepPage)
│   ├── recommandations/          # Liste + [id] détail + partenaires
│   ├── pneu/                     # UI BLE temps réel + graphes SVG
│   ├── jeu/                      # Mini-jeu « La Côte »
│   ├── profil/                   # Édition profil
│   ├── (auth)/                   # login / register
│   └── api/                      # Routes REST (voir section API)
│       ├── [resource]/           # CRUD générique catch-all (16 ressources)
│       ├── auth/                 # register, login, logout, me, profile
│       ├── configurateur/        # options, submit
│       ├── recommendations/      # list, generate
│       ├── esp-devices/[id]/readings/   # ingestion capteur
│       ├── dashboard/ leaderboard/      # handlers spéciaux
│       └── admin/seed/           # re-seed du catalogue (auth requise)
├── lib/                          # Logique métier (server-only majoritaire)
│   ├── auth.ts password.ts       # JWT maison + hash scrypt
│   ├── prisma.ts                 # Singleton PrismaClient + adapter pg
│   ├── crud-resources.ts crud-handlers.ts   # Registre + handlers CRUD
│   ├── special-api-handlers.ts   # dashboard / recommendations / esp readings
│   ├── configurator*.ts          # Schéma d'étapes + persistance bike/pref
│   ├── recommendations.ts        # Moteur de scoring des roues
│   ├── esp-readings.ts dashboard.ts game-scores.ts
│   ├── site.ts                   # SITE_URL / SITE_NAME (server-only)
│   └── *.generated.ts            # wheels.generated.ts (catalogue de roues)
├── prisma/
│   ├── schema.prisma             # 17 modèles, mapping snake_case
│   ├── seed.ts                   # Entrypoint seed (instancie l'adapter)
│   ├── migrations/               # init, add_game_score, add_wheel_sensor_ble_fields
│   └── data/                     # catalogue-bike.tsv + parse-catalogue.mjs
├── firmware/
│   ├── michelin-ride-esp32/*.ino # Sketch BLE (simulation par défaut)
│   └── README.md                 # Contrat BLE + procédure de flash
├── tests/
│   ├── unit/ integration/        # Vitest (8 + 5 fichiers)
│   └── helpers/ stubs/           # makeRequest, fixtures, stub server-only
├── .github/workflows/            # ci.yml (test/lint/build) + deploy.yml (GHCR + VPS)
├── Dockerfile docker-entrypoint.sh
├── docker-compose.yml            # Dev : Postgres (55432) + Adminer (8080)
├── docker-compose.prod.yml       # Prod : web (127.0.0.1:3001→3000) + Postgres 17
├── prisma.config.ts              # Config Prisma 7 (schema, migrations, seed)
└── vitest.config.mts eslint.config.mjs tsconfig.json
```

> ⚠️ `app/catalogue/_data/catalogue.generated.ts` et `lib/wheels.generated.ts` sont **générés** — ne pas les éditer à la main. Régénération via `node prisma/data/parse-catalogue.mjs` (lit `prisma/data/catalogue-bike.tsv`).

---

## ⚡ Démarrage rapide

### Prérequis

- **Node 22**
- **pnpm 11.3.0** (`corepack enable`)
- **Docker** (pour PostgreSQL en local)

### 1. Cloner et installer

```bash
git clone https://github.com/elopawsy/michelin.git
cd michelin
pnpm install
```

### 2. Configurer l'environnement

Copier le modèle `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Le fichier contient :

```bash
DATABASE_URL="postgres://michelin:michelin@localhost:55432/michelin"
JWT_SECRET="change-this-dev-secret"
```

> En **dev**, `JWT_SECRET` retombe sur `development-only-jwt-secret` s'il est absent. En **production**, son absence provoque une erreur au runtime. La variable optionnelle `NEXT_PUBLIC_SITE_URL` peut surcharger l'URL du site (cf. [Variables d'environnement](#variables-denvironnement)).

### 3. Lancer PostgreSQL

```bash
docker compose up -d db
```

Postgres est alors exposé sur **`localhost:55432`** et Adminer sur **`localhost:8080`** (serveur `db`, user/mot de passe/base `michelin`).

### 4. Migrer et seeder la base

```bash
pnpm db:migrate     # applique les migrations (première fois)
pnpm db:seed        # peuple référentiels, catalogue de roues, démo
```

Le seed crée un **utilisateur de démo** :

```
Email        : demo@michelin.local
Mot de passe : DemoPassword123!
```

(avec 4 vélos City/Road/Gravel/Mountain, 1 ESP32 et 4 relevés capteur chacun, préférences et recommandations.)

### 5. Démarrer en développement

```bash
pnpm dev
```

L'application tourne sur **[http://localhost:3000](http://localhost:3000)**.

> Variante tout-conteneur : `docker compose --profile app up --build` (app sur le port 3000).

### Scripts pnpm

| Script | Commande | Rôle |
| --- | --- | --- |
| `pnpm dev` | `prisma generate && next dev` | Serveur de développement |
| `pnpm build` | `prisma generate && next build` | Build de production |
| `pnpm start` | `next start` | Démarrage du build |
| `pnpm lint` | `prisma generate && eslint` | Linter |
| `pnpm test` | `prisma generate && vitest run` | Tests (une passe) |
| `pnpm test:watch` | `vitest` | Tests en watch |
| `pnpm db:generate` | `prisma generate` | (Re)génère le client Prisma |
| `pnpm db:migrate` | `prisma migrate dev` | Migration en dev |
| `pnpm db:seed` | `prisma db seed` | Seed de la base |
| `pnpm db:studio` | `prisma studio` | Explorateur de base |

---

## 🗄️ Base de données

La couche données repose sur **PostgreSQL** via **Prisma 7.8** :

- Generator **`prisma-client`** (nouveau format) → client TypeScript généré dans **`generated/prisma`** (gitignoré), importé via `@/generated/prisma/client`.
- Adapter **`@prisma/adapter-pg`** obligatoire (pas de moteur Rust natif) ; la `connectionString` est passée à l'adapter, pas dans la `datasource` du schéma.
- La configuration vit dans **`prisma.config.ts`** (Prisma 7 remplace le bloc `prisma` du `package.json`) : `schema`, `migrations.path`, `seed = 'tsx prisma/seed.ts'`.
- `DATABASE_URL` retombe en local sur `postgres://michelin:michelin@localhost:55432/michelin`.

> ℹ️ **Terminologie** : l'UI parle de « pneus » tandis que le modèle de données parle de « roues ». Dans le schéma, **une entrée de catalogue de pneus = un modèle `Wheel`** ; le moteur de scoring raisonne donc sur des `Wheel`/`WheelType`.

### Modèle de données (17 modèles)

- **Utilisateurs** — `User` (auth maison, `passwordHash` au format `scrypt:<salt>:<hex>`).
- **Vélos** — `UserBicycle` reliés au catalogue `BicycleBrand` / `BicycleType` / `BicycleModel`.
- **Capteurs** — `EspDevice` (serial unique, firmware, batterie, `lastSeenAt`) + `WheelSensorReading` (pression, usure, vitesse, températures, distance, résistance au roulement, surface, champs BLE avant/arrière optionnels).
- **Catalogue de roues** — `Wheel` / `WheelType` (scores rolling/comfort/speed/durability) reliés par 3 tables de scoring à clés composites : `WheelBicycleType`, `WheelRoadSurface`, `WheelGoal`.
- **Recommandations** — `WheelRecommendation` (score + raison, par vélo).
- **Préférences** — `UserPreference` (objectif, surface, distance hebdo, priorités 1–10).
- **Mini-jeu** — `GameScore` (meilleur score/distance par utilisateur, `userId @unique`, `@@index([bestScore])`).

Stratégies `onDelete` : **Cascade** (user → vélos/devices/readings), **Restrict** (catalogue), **SetNull** (surface sur un relevé).

### Commandes Prisma

```bash
pnpm db:generate   # prisma generate — client dans generated/prisma
pnpm db:migrate    # prisma migrate dev
pnpm db:seed       # prisma db seed (tsx prisma/seed.ts)
pnpm db:studio     # prisma studio
```

> `prisma generate` est déjà préfixé dans les scripts `dev`, `build`, `lint` et `test`. Migrations existantes : `20260616102322_init`, `20260617120000_add_game_score`, `20260617133000_add_wheel_sensor_ble_fields`.

### Régénérer le catalogue

```bash
node prisma/data/parse-catalogue.mjs
# lit prisma/data/catalogue-bike.tsv
# écrit app/catalogue/_data/catalogue.generated.ts ET lib/wheels.generated.ts
```

Volumes générés : ~79 gammes de catalogue, 77 roues de seed, 2 types de roues.

---

## 📡 Pneu connecté & firmware ESP32

La chaîne de bout en bout : un capteur **ESP32** annonce un service BLE GATT, l'application web s'y connecte via **Web Bluetooth**, lit des trames JSON (~1×/s), les affiche en cartes live, et les persiste périodiquement pour produire l'historique graphique et alimenter le dashboard.

### Contrat BLE

| Élément | Valeur |
| --- | --- |
| Nom annoncé | `Michelin Ride` |
| Service UUID | `4fafc201-1fb5-459e-8fcc-c5c9c331914b` |
| Caractéristique UUID (NOTIFY) | `beb5483e-36e1-4688-b7f5-ea07361b26a8` |
| Fréquence d'émission | ~1×/s (`INTERVAL_MS = 1000` côté firmware) |
| Sauvegarde en base (web) | toutes les **60 s** (`SAVE_INTERVAL_MS = 60000`), historique plafonné à **120 points** |

Trame JSON (clés courtes pour tenir dans le MTU BLE) :

```json
{ "pf": 2.41, "pr": 2.38, "wf": 12, "wr": 18, "v": 31.4, "d": 1280, "bat": 87 }
```

| Clé | Mesure | Unité |
| --- | --- | --- |
| `pf` / `pr` | Pression avant / arrière | bar |
| `wf` / `wr` | Usure avant / arrière | % |
| `v` | Vitesse | km/h |
| `d` | Distance | km |
| `bat` | Batterie | % |

> ℹ️ **Champs avant/arrière en base** : la trame BLE comporte **7 clés**. Côté Prisma, `WheelSensorReading` expose des colonnes BLE optionnelles supplémentaires (`frontPressureBar` / `rearPressureBar` / `frontWearPercent` / `rearWearPercent`) qui reçoivent respectivement `pf` / `pr` / `wf` / `wr` lorsqu'un firmware les émet. En simulation, ces colonnes peuvent rester nulles si la trame ne fournit que les agrégats.

### Contraintes navigateur

- **Web Bluetooth** requiert **Chrome ou Edge** (non supporté par Firefox/Safari).
- Contexte **sécurisé** obligatoire : **HTTPS** ou **localhost**.
- La connexion doit être déclenchée par un **geste utilisateur** (bouton ou étape capteur du configurateur).

### Tester en local

```bash
pnpm dev
# Ouvrir /pneu dans Chrome ou Edge → « Connecter le pneu » → choisir « Michelin Ride »
```

L'ingestion serveur passe par `POST /api/esp-devices/{id}/readings` (auth requise, renvoie `201`).

### Flasher l'ESP32

1. Installer l'IDE Arduino + le core **esp32** (URL du gestionnaire de cartes : `https://espressif.github.io/arduino-esp32/package_esp32_index.json`).
2. Ouvrir `firmware/michelin-ride-esp32/michelin-ride-esp32.ino`.
3. Choisir la carte (ex. *ESP32 Dev Module*), puis **Téléverser**.
4. Ouvrir le **moniteur série à 115200 bauds** pour observer les trames émises.

> Le sketch **simule** les mesures par défaut. Pour brancher de vrais capteurs, remplacer le bloc balisé **« CAPTEUR RÉEL »** dans `majMesures()`.
>
> ⚠️ Si vous changez un UUID ou une clé de trame, mettez-le à jour **des deux côtés** : `app/_lib/ble.ts` (constantes `SERVICE`/`CHAR`, interface `Trame`) **et** le firmware (`.ino` + `firmware/README.md`).

---

## 🎮 Mini-jeu « La Côte »

Un Hill-Climb 2D en canvas sur **`/jeu`** : on pédale un vélo gravel le plus loin possible pour ramasser des pièces et débloquer toute la gamme.

- **6 pneus** débloquables : `city` (gratuit), `endurance` (1 200), `road` (2 400), `gravel` (3 600), `trail` (4 800), `ride700` (8 000, premium — requiert `gravel` + `trail`).
- **Commandes** : `→ / ↑ / D` pédaler · `← / ↓ / A / Espace` freiner · `P` ou `Échap` pause · `Entrée` démarrer/rejouer · 2 boutons tactiles sur mobile.
- **Score** = distance (m) + pièces × 10 ; progression persistée en `localStorage` (clé `michelin-jeu-v1`).
- **Classement public** lié aux comptes : `GET /api/leaderboard?limit=10` (public, max 100), `POST /api/leaderboard` (auth JWT, payload `{score, distance, tireId}`). Garde-fous anti-triche serveur (plafond `10 000 000` sur score/distance, validation du `tireId`).

---

## 🧪 Tests & qualité

```bash
pnpm test          # prisma generate && vitest run
pnpm test:watch    # vitest (mode watch)
pnpm lint          # prisma generate && eslint
```

- **13 fichiers** de test, **63 cas (`it`)**, 100 % au vert en ~0,6 s.
- **Aucune base de données requise** : Prisma est systématiquement mocké, et l'import `server-only` de Next 16 est neutralisé par un stub aliasé dans `vitest.config.mts`.
- **Unitaires** (`tests/unit/`, 8 fichiers) : JWT/auth, garde de proxy, CRUD générique, lectures ESP/BLE, `parseTrame` + `connecter`, scores de jeu, réponses API, partenaires de reco.
- **Intégration** (`tests/integration/`, 5 fichiers) : invocation directe des handlers de routes App Router (auth, CRUD scopé, dashboard/recommendations/esp readings, leaderboard, configurateur).
- ESLint 9 en flat config (`eslint-config-next` core-web-vitals + typescript), TypeScript en mode `strict`.

> Pas de tests E2E ni de tests de composants React ; aucun seuil de couverture configuré (cf. [Limitations connues](#-limitations-connues)).

---

## 🚢 Déploiement & CI/CD

### Conteneurisation

- **Dockerfile multi-stage** (4 étapes : `base` / `deps` / `build` / `runner`) sur **Node 22** (`node:22-bookworm-slim`, pnpm via corepack), cache du store pnpm monté.
- **`docker-entrypoint.sh`** applique les migrations (`pnpm exec prisma migrate deploy`) **avant** de lancer `pnpm start`.
- `openssl` + `ca-certificates` installés (requis par Prisma) ; `NODE_ENV=production`, `PORT=3000`, `HOSTNAME=0.0.0.0` côté runner.
- L'étape `runner` copie l'arbre `/app` complet (et non un standalone Next) pour garder le CLI Prisma disponible.

### Production (`docker-compose.prod.yml`)

- Service **web** exposé sur **`127.0.0.1:3001 → 3000`** (derrière un reverse proxy ; le port 3000 est déjà pris sur le VPS partagé). Le conteneur écoute sur `PORT=3000`, `HOSTNAME=0.0.0.0`.
- Service **db** : **PostgreSQL 17** (`postgres:17-alpine`), healthcheck `pg_isready`, volume persistant `db-data`.
- `DATABASE_URL` prod : `postgres://michelin:${POSTGRES_PASSWORD}@db:5432/michelin`.
- Image : **`ghcr.io/elopawsy/michelin:latest`** (tags poussés : `type=sha` et `latest`).
- Le compose prod réside dans `/opt/michelin/` sur le VPS (avec un fichier `.env`). Déploiement :

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Workflows GitHub Actions

| Workflow | Déclencheur | Étapes | Notification Discord |
| --- | --- | --- | --- |
| **CI** (`ci.yml`) | `pull_request` + push hors `main` | `pnpm test` → `lint` → `build` (DATABASE_URL/JWT_SECRET factices) | échec uniquement |
| **Deploy** (`deploy.yml`) | push sur `main` | build → push **GHCR** (sha + latest) → SSH VPS `pull` + `up -d` | succès **et** échec |

Le déploiement utilise le cache buildx GitHub Actions (`type=gha mode=max`), copie `docker-compose.prod.yml` sur le VPS via `scp`, se logue à GHCR via `GITHUB_TOKEN`, et est sérialisé (un seul déploiement à la fois).

### Variables d'environnement

| Variable | Portée | Rôle |
| --- | --- | --- |
| `DATABASE_URL` | dev + prod | Chaîne de connexion PostgreSQL |
| `JWT_SECRET` | **requis en prod** | Secret de signature des tokens (fallback dev uniquement) |
| `NEXT_PUBLIC_SITE_URL` | optionnel | Surcharge `SITE_URL` (défaut : `https://michelin.doublepoints3.com`) |
| `NODE_ENV` | prod | `production` |
| `POSTGRES_PASSWORD` | prod (compose) | Mot de passe Postgres interpolé dans le compose |

> ℹ️ Seuls `DATABASE_URL` et `JWT_SECRET` figurent dans `.env.example`. Les autres variables sont fournies par l'environnement d'exécution (prod / CI / compose) et n'ont pas à être copiées en local.

### Secrets GitHub Actions

| Secret | Rôle |
| --- | --- |
| `DISCORD_WEBHOOK` | Notifications CI/Deploy |
| `VPS_HOST` / `VPS_USER` / `VPS_PORT` | Cible SSH du VPS |
| `VPS_SSH_KEY` | Clé privée SSH de déploiement |
| `GITHUB_TOKEN` | Fourni automatiquement (push GHCR) |

---

## 🔌 API — repères

- **Format de réponse** : succès `{ data, meta? }`, erreur `{ error }` (codes `400/401/404/409/422/500`).
- **Authentification** : cookie `auth_token` (httpOnly, sameSite `lax`, secure en prod, TTL 7 jours) **ou** header `Authorization: Bearer <token>`. Mots de passe hashés en scrypt (`scrypt:<salt>:<hex>`, longueur minimale 8 caractères).
- **Auth dédiée** : `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PATCH /api/auth/profile`.
- **Configurateur** : `GET /api/configurateur/options`, `POST /api/configurateur/submit` (`201` ; `401` non connecté ; `422` validation).
- **Recommandations** : `GET /api/recommendations` (`?user_bicycle_id`, `?take` 1–100, défaut 20), `POST /api/recommendations/generate` (`userBicycleId` requis).
- **CRUD générique** : `GET|POST /api/[resource]`, `GET|PATCH|DELETE /api/[resource]/[...key]` sur **16 ressources** (`users`, `bicycle-brands`, `bicycle-types`, `bicycle-models`, `user-bicycles`, `goals`, `road-surfaces`, `user-preferences`, `esp-devices`, `wheel-sensor-readings`, `wheel-types`, `wheels`, `wheel-road-surfaces`, `wheel-goals`, `wheel-bicycle-types`, `wheel-recommendations`). Pagination via `?skip=` / `?take=` (défaut 100).
- **Handlers spéciaux** : `GET /api/dashboard`, `POST /api/esp-devices/[id]/readings`, `GET|POST /api/leaderboard`, `POST /api/admin/seed` (auth requise, **sans rôle admin** — cf. [Limitations connues](#-limitations-connues)).
- Pas de `middleware.ts` : la protection des pages se fait page par page (`getCurrentAuthSession` + redirect vers `/login?next=...`, défaut post-login `/pneu`).
- `robots.ts` interdit `/api`, `/login`, `/register` ; le `sitemap` ne référence que `/` et `/blog` (+ articles) — les pages derrière auth sont volontairement exclues.

---

## 🚧 Limitations connues

Le projet est un **prototype de hackathon** ; certaines parties sont volontairement simulées ou incomplètes.

**Démo / mocks**

- **Magasins partenaires fictifs** : 3 boutiques mockées, URLs en `shop.michelin-ride.example` — aucune intégration marchande réelle.
- **Firmware en simulation** : le sketch ESP32 génère des mesures synthétiques par défaut (bloc « CAPTEUR RÉEL » à compléter pour de vrais capteurs).

**Dette / bugs connus**

- **Raison de recommandation en anglais** : la justification textuelle des recos est générée en anglais alors que l'UI est en français.
- **Pas de rôle admin** : `POST /api/admin/seed` exige une session authentifiée mais **aucune vérification de rôle admin**.
- **Couverture de tests partielle** : pas de tests E2E ni de tests de composants React, aucun seuil de couverture configuré.

---

## 🛟 Dépannage BLE

| Symptôme | Pistes de résolution |
| --- | --- |
| L'appareil **« Michelin Ride »** n'apparaît pas dans le sélecteur | Vérifier que le **Bluetooth système** est activé · que le capteur est **sous tension et à portée** · qu'il n'est pas **déjà connecté** à un autre onglet/appareil (la connexion est exclusive) · relancer le scan après avoir rapproché le capteur. |
| Rien ne s'affiche **après la connexion** | La connexion doit être déclenchée par un **geste utilisateur** (clic sur « Connecter le pneu » ou étape capteur). Une tentative hors interaction est refusée par le navigateur. |
| **Web Bluetooth indisponible** | Utiliser **Chrome ou Edge** (Firefox/Safari ne supportent pas l'API) dans un **contexte sécurisé** (HTTPS ou `localhost`). |
| Sous **Linux**, Web Bluetooth ne fonctionne pas | Activer le flag expérimental `chrome://flags/#enable-web-bluetooth` (souvent requis selon la version/distribution), puis redémarrer le navigateur. |
| Connexion **occupée** entre `/pneu` et l'étape capteur | La connexion BLE est un **singleton partagé** : fermer/déconnecter l'une avant d'ouvrir l'autre pour éviter le conflit. |

---

## 🤝 Contribution

Workflow de groupe (hackathon) :

1. **Brancher** depuis `main`, développer, ouvrir une **Pull Request**.
2. La **CI** (`ci.yml`) tourne automatiquement sur les PR et les push hors `main` (`test` → `lint` → `build`) : une **CI verte est requise** avant merge.
3. Le **merge sur `main`** déclenche `deploy.yml` (build → push GHCR → déploiement VPS) : tout merge part automatiquement en **production**.

> ⚠️ Ne pas pousser directement sur `main` sans PR : c'est la branche de déploiement.

---

## 📄 Licence

Ce projet est sous **licence propriétaire — tous droits réservés**. Voir le fichier [`LICENSE`](./LICENSE) pour les conditions complètes. Aucune réutilisation, redistribution ou usage commercial n'est autorisé sans accord écrit préalable.

> **Disclaimer** : projet **pédagogique** réalisé dans un cadre académique, **non affilié à Michelin**. La marque « Michelin » est une marque déposée de son propriétaire ; elle est citée ici à titre **purement illustratif**.

---

## 👥 Crédits & contexte

Projet réalisé dans le cadre d'un **Hackathon ESGI Reims — Master 2** (promotion IW 2026).

> _Contributeurs : compléter avec les noms / handles GitHub de l'équipe._

Dépôt : [github.com/elopawsy/michelin](https://github.com/elopawsy/michelin) · En ligne : [michelin.doublepoints3.com](https://michelin.doublepoints3.com)

© 2026 — Michelin Ride.
