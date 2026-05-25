FROM node:20-slim AS builder
WORKDIR /app

# Prisma's engines link against libssl at runtime. node:20-slim (Debian
# bookworm) ships openssl 3, but the package needs to be present for the
# query/schema engines to load.
RUN apt-get update -qq && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install ALL deps (including devDeps — needed for TypeScript build)
COPY package.json package-lock.json* ./
RUN npm ci

# Generate Prisma client for linux/alpine
COPY prisma ./prisma
RUN npx prisma generate

# Build TypeScript → dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Production image ───────────────────────────────────────────────────────────
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -qq && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install only production deps (smaller image)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Regenerate Prisma client for production (same alpine arch)
COPY prisma ./prisma
RUN npx prisma generate

# Copy compiled JS
COPY --from=builder /app/dist ./dist

# Uploads directory (will be overridden by volume in docker-compose)
RUN mkdir -p uploads

EXPOSE 3001

# Push the Prisma schema to the database (idempotent: no-op when schema already
# matches), then start the server. Use --accept-data-loss for first-deploy
# bootstrap; switch to `prisma migrate deploy` once a migrations folder exists.
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && node dist/index.js"]
