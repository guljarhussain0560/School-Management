# ==============================================================================
# Production Dockerfile - Next.js Multi-Stage Build
# ==============================================================================

# Stage 1: Base image with Node 20 Alpine
FROM node:25-alpine AS base
RUN apk add --no-cache libc6-compat openssl curl
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /app/public


# Generate Prisma Client & Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXTAUTH_SECRET="ci-build-test-secret-key-32chars-minimum"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV DATABASE_URL="postgresql://school_user:school_password@postgres:5432/school_management?schema=public"

RUN npx prisma generate
RUN npm run build

# Stage 4: Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and built server
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000", "-H", "0.0.0.0"]

