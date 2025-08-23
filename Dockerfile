# Production Dockerfile for PoolManager
# Simple single-stage build

FROM node:22-alpine
WORKDIR /app

# Install system dependencies and create user
RUN apk add --no-cache curl postgresql-client libc6-compat openssl && \
    rm -rf /var/cache/apk/* && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy package files and install dependencies
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate && npm run build

# Copy entrypoint script and set permissions
COPY scripts/docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh && \
    mkdir -p ./backups ./logs && \
    chown -R nextjs:nodejs ./backups ./logs ./node_modules ./prisma ./.next

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000
USER nextjs

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]