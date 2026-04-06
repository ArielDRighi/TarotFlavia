# ── Stage 1: Dependencies ───────────────────────────────────────
# Context: frontend/ directory (Railway Root Directory = /frontend)
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json ./
RUN npm install

# ── Stage 2: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Accept NEXT_PUBLIC_* vars as build args (Railway injects them as --build-arg)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE
ARG NEXT_PUBLIC_ANONYMOUS_ACCESS_ENABLED

# Build Next.js with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE=$NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE
ENV NEXT_PUBLIC_ANONYMOUS_ACCESS_ENABLED=$NEXT_PUBLIC_ANONYMOUS_ACCESS_ENABLED
RUN npm run build

# ── Stage 3: Production (minimal) ──────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Standalone output (non-monorepo context)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
EXPOSE 3001

CMD ["node", "server.js"]
