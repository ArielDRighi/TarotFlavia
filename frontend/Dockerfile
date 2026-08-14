# ── Stage 1: Build ──────────────────────────────────────────────
# Contexto: raíz del repositorio (docker build -f frontend/Dockerfile .)
#
# ⚠️ Railway: Root Directory = `/` y Dockerfile Path = `frontend/Dockerfile`.
# Las dos mitades van juntas: con una sola, el build falla (T-SEO-005).
#
# Se construye desde la raíz —igual que el backend— para poder instalar con
# `npm ci` contra el `package-lock.json` del monorepo. Antes se copiaba solo
# `frontend/package.json` y se corría `npm install`, que resolvía versiones más
# nuevas que local y que CI (16.3.0 vs 16.0.6 en el incidente del 8-ago-2026) y
# rompió el deploy dos semanas con CI en verde.
FROM node:20-alpine AS builder

WORKDIR /app

# Archivos de la raíz del monorepo para npm workspaces + lockfile
COPY package.json package-lock.json ./

# package.json del workspace, para que npm resuelva sus dependencias
COPY frontend/package.json ./frontend/

# Instalación reproducible: exactamente las versiones del lockfile
RUN npm ci -w frontend

# Código fuente del frontend.
# ⚠️ VA DESPUÉS del install a propósito. Además de la caché de capas: `frontend/`
# trae el `.npmrc` con legacy-peer-deps, y adelantar este COPY lo pondría a
# gobernar la instalación, que es justo lo que esta tarea vino a sacar del medio.
COPY frontend/ ./frontend/

# Las NEXT_PUBLIC_* llegan como build args (Railway las inyecta con --build-arg).
# ⚠️ Sin NEXT_PUBLIC_API_URL el build falla al recolectar /tarotistas/[id]/reservar.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE
ARG NEXT_PUBLIC_ANONYMOUS_ACCESS_ENABLED
ARG NEXT_PUBLIC_ADSENSE_CLIENT

# Build de Next.js con output standalone
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE=$NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE
ENV NEXT_PUBLIC_ANONYMOUS_ACCESS_ENABLED=$NEXT_PUBLIC_ANONYMOUS_ACCESS_ENABLED
ENV NEXT_PUBLIC_ADSENSE_CLIENT=$NEXT_PUBLIC_ADSENSE_CLIENT

WORKDIR /app/frontend
RUN npm run build

# ── Stage 2: Producción (mínima) ───────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Standalone en contexto de monorepo: Next detecta la raíz del workspace, así que
# el output queda como `standalone/frontend/server.js` con los `node_modules`
# izados en `standalone/node_modules`.
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
EXPOSE 3001

CMD ["node", "frontend/server.js"]
