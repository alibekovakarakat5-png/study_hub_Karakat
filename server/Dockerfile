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

# Run migrations then start server
CMD ["node", "dist/index.js"]
