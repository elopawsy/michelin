# syntax=docker/dockerfile:1

# ---- Base : Node 22 LTS + pnpm via corepack ----
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# ---- Dépendances (cache séparé du code) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- Build (prisma generate && next build) ----
FROM deps AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# ---- Runtime ----
# On copie tout /app (build + node_modules complet) : Prisma CLI reste
# disponible pour `migrate deploy` au démarrage, et les symlinks pnpm
# restent valides car l'arbre node_modules est copié d'un bloc.
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=build /app ./
RUN chmod +x docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
