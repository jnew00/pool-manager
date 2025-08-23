# Production Dockerfile for PoolManager
# Optimized multi-stage build

# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production && \
    npx prisma generate

# Stage 2: Builder  
FROM node:22-alpine AS builder
WORKDIR /app

# Install all dependencies for build
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Generate Prisma client and build
RUN npx prisma generate && npm run build

# Stage 3: Runner (Production)
FROM node:22-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install minimal runtime dependencies
RUN apk add --no-cache curl postgresql-client && \
    rm -rf /var/cache/apk/*

# Copy built application (Next.js standalone includes everything needed)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create directories and set permissions  
RUN mkdir -p ./backups ./logs && \
    chown -R nextjs:nodejs ./backups ./logs ./node_modules ./prisma

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

EXPOSE 3000
USER nextjs

CMD ["node", "server.js"]