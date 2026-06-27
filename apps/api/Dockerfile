# --- Base Node Image ---
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

# --- Dependencies Pruner ---
FROM base AS pruner
RUN pnpm add -g turbo
COPY . .
RUN turbo prune api --docker

# --- Installer Stage ---
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build Stage ---
FROM base AS builder
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .
RUN find . -name "*.tsbuildinfo" -delete
RUN pnpm --filter api build

# --- Runner (Production) Stage ---
FROM base AS runner
ENV NODE_ENV=production

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app ./

USER nestjs

EXPOSE 4000
ENV PORT=4000

CMD ["node", "apps/api/dist/main.js"]
