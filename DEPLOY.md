# Déploiement — CI/CD GitHub Actions → VPS (Docker + PostgreSQL)

## Vue d'ensemble

```
push sur main
   │
   ├─ .github/workflows/deploy.yml
   │     1. build l'image Docker (Next.js + Prisma)
   │     2. push sur GHCR : ghcr.io/elopawsy/michelin
   │     3. SSH sur le VPS → docker compose pull && up -d
   │
   └─ sur le VPS (/opt/michelin)
         • service web  → Next.js (127.0.0.1:3000), migrations Prisma au démarrage
         • service db   → PostgreSQL 17 (volume persistant db-data)
         • ton reverse proxy (nginx/Caddy) → https://ton-domaine → 127.0.0.1:3000
```

Les **PR** déclenchent `ci.yml` (lint + build). Les **push sur `main`** déclenchent `deploy.yml`.

---

## 1. GitHub — Secrets

_Settings → Secrets and variables → Actions → New repository secret_ :

| Secret | Valeur |
| --- | --- |
| `VPS_HOST` | IP ou domaine du VPS |
| `VPS_USER` | utilisateur SSH (ex. `deploy`) |
| `VPS_SSH_KEY` | **clé privée** SSH (contenu complet) autorisée sur le VPS |
| `VPS_PORT` | _(optionnel)_ port SSH si ≠ 22 |
| `GHCR_TOKEN` | _(si image privée)_ PAT avec scope `read:packages` |

> Génère une paire de clés dédiée au déploiement :
> `ssh-keygen -t ed25519 -f deploy_key -C "github-deploy"` →
> mets `deploy_key.pub` dans `~/.ssh/authorized_keys` du VPS, et `deploy_key` (privée) dans `VPS_SSH_KEY`.

### Image GHCR : publique ou privée ?

L'image est poussée sur `ghcr.io/elopawsy/michelin`. Au premier push, va dans
_Packages_ du dépôt et choisis :

- **Publique** (plus simple) → supprime la ligne `docker login …` dans `deploy.yml`, pas besoin de `GHCR_TOKEN`.
- **Privée** → crée un PAT (`read:packages`) et mets-le dans `GHCR_TOKEN`.

---

## 2. VPS — préparation (une seule fois)

Prérequis : **Docker + Docker Compose v2** installés.

```bash
# Dossier de déploiement
sudo mkdir -p /opt/michelin
sudo chown "$USER" /opt/michelin
cd /opt/michelin

# Fichier d'environnement (NON versionné)
cat > .env <<'EOF'
POSTGRES_PASSWORD=mets-un-mot-de-passe-solide
JWT_SECRET=mets-un-secret-long-et-aleatoire
EOF
chmod 600 .env
```

> `docker-compose.prod.yml` est copié automatiquement sur le VPS par le workflow
> à chaque déploiement — pas besoin de le créer à la main. Pour un tout premier
> lancement manuel, tu peux le copier depuis le dépôt.

Ensuite, pousse sur `main` : le workflow build, push et démarre tout.
Vérifie : `docker compose -f docker-compose.prod.yml ps` et `… logs -f web`.

Les **migrations Prisma s'appliquent automatiquement** au démarrage du conteneur
`web` (`prisma migrate deploy` dans l'entrypoint).

---

## 3. Reverse proxy (tu en as déjà un)

L'app n'écoute que sur `127.0.0.1:3000`. Pointe ton domaine dessus :

**Caddy** (TLS automatique) :

```
ride.ton-domaine.com {
    reverse_proxy 127.0.0.1:3000
}
```

**nginx** :

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 4. Développement local

```bash
docker compose up -d db        # PostgreSQL + Adminer (http://localhost:8080)
pnpm install
pnpm prisma migrate dev        # applique les migrations (première fois)
pnpm dev                       # http://localhost:3000
```

`.env` local (copie de `.env.example`) :

```
DATABASE_URL="postgres://michelin:michelin@localhost:5432/michelin"
JWT_SECRET="change-this-dev-secret"
```

Lancer l'app complète en conteneur (parité prod) :

```bash
docker compose --profile app up --build
```

---

## 5. Faire évoluer le schéma de base

1. Modifier `prisma/schema.prisma`.
2. En local : `pnpm prisma migrate dev --name <description>` → crée `prisma/migrations/…`.
3. Commit + push sur `main`.
4. Au déploiement, `prisma migrate deploy` applique la nouvelle migration sur le VPS.

> Ne jamais éditer une migration déjà déployée : en créer une nouvelle.
```
