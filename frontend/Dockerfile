# ── Stage 1: Dependencies ───────────────────────────────────────
# Context: repository root (docker build -f frontend/Dockerfile .)
FROM node:20-alpine AS deps

WORKDIR /app

# Copy monorepo root files for npm workspaces
COPY package.json package-lock.json ./

# Copy frontend package.json for workspace resolution
COPY frontend/package.json ./frontend/

# Install dependencies (workspace-aware)
RUN npm ci -w frontend

# ── Stage 2: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy frontend source code
COPY frontend/ ./frontend/

# Build Next.js with standalone output
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: Production (minimal) ──────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Standalone output preserves monorepo structure: .next/standalone/frontend/
COPY --from=builder /app/frontend/.next/standalone/node_modules ./node_modules
COPY --from=builder /app/frontend/.next/standalone/frontend ./frontend
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

WORKDIR /app/frontend

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
EXPOSE 3001

CMD ["node", "server.js"]
