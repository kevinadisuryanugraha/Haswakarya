# ═══════════════════════════════════════════════════════════════════════════
# Haswakarya Crewing Operating System (H-COS) — Dockerfile Multi-Stage
# Next.js 15 App Router + Standalone Output + Non-Root Security (Alpine)
# ═══════════════════════════════════════════════════════════════════════════

# ─── Stage 1: Dependencies ──────────────────────────────────────────────────
FROM node:20-alpine AS deps
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ─── Stage 2: Builder ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client for Linux x64
RUN npx prisma generate

# Batasi heap memory builder agar aman di VPS
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

# ─── Stage 3: Worker (antrean BullMQ / polling) ───────────────────────────
FROM node:20-alpine AS worker
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN apk add --no-cache libc6-compat \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Worker menjalankan TypeScript lewat tsx, jadi butuh node_modules penuh (termasuk devDeps).
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs package.json tsconfig.json ./
COPY --chown=nextjs:nodejs prisma ./prisma
COPY --chown=nextjs:nodejs src ./src

RUN npx prisma generate \
    && mkdir -p /app/storage/vault \
    && chown -R nextjs:nodejs /app/storage

USER nextjs

CMD ["npx", "tsx", "src/server/worker.ts"]

# ─── Stage 4: Runner ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Salin aset standalone Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Siapkan direktori storage penyimpanan dokumen maritim berizin aman
RUN mkdir -p /app/storage/vault && chown -R nextjs:nodejs /app/storage

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
