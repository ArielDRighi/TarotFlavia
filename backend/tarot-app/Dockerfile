# ── Stage 1: Build ──────────────────────────────────────────────
# Context: repository root (docker build -f backend/tarot-app/Dockerfile .)
FROM node:20-alpine AS builder

# sweph (Swiss Ephemeris) requires native build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy monorepo root files for npm workspaces
COPY package.json package-lock.json ./

# Copy backend package.json for workspace resolution
COPY backend/tarot-app/package.json ./backend/tarot-app/

# Install all dependencies (workspace-aware)
RUN npm ci -w backend/tarot-app

# Copy backend source code
COPY backend/tarot-app/ ./backend/tarot-app/

# Build
WORKDIR /app/backend/tarot-app
RUN npm run build

# Prune devDependencies before copying to production stage
WORKDIR /app
RUN npm prune --omit=dev -w backend/tarot-app

# ── Stage 2: Production ────────────────────────────────────────
FROM node:20-alpine

# sweph native bindings need libstdc++ at runtime
RUN apk add --no-cache libstdc++

WORKDIR /app

# Copy monorepo root for workspace resolution
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built backend
COPY --from=builder /app/backend/tarot-app/dist ./backend/tarot-app/dist
COPY --from=builder /app/backend/tarot-app/package.json ./backend/tarot-app/
COPY --from=builder /app/backend/tarot-app/node_modules ./backend/tarot-app/node_modules

WORKDIR /app/backend/tarot-app

ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=UTC
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health/live',(r)=>{if(r.statusCode!==200)process.exit(1)})"

CMD ["node", "dist/main"]
