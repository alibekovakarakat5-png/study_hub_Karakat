FROM node:20-alpine AS builder
WORKDIR /app

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
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

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
