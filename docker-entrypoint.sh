#!/bin/sh
set -e

# Applique les migrations Prisma sur la base PostgreSQL avant de démarrer.
# `migrate deploy` n'applique que des migrations déjà générées (jamais de prompt),
# c'est la commande adaptée à la production.
echo "→ Application des migrations Prisma…"
pnpm exec prisma migrate deploy

echo "→ Démarrage de Next.js (port ${PORT})…"
exec pnpm start
