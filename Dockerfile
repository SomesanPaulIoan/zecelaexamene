# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL isn't needed at build time (no DB calls happen during `next build` here),
# but Prisma's generator still needs the schema present, which COPY . . already provides.
RUN npx prisma generate
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so they must be
# passed in as build args (.dockerignore excludes .env.production from the build context
# entirely — env_file: in docker-compose.prod.yml only reaches the app at container
# runtime, too late for `next build` to see this).
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/resources ./resources

# public/uploads is a mounted volume in production (admin-uploaded book images must
# survive redeploys) — pre-create it owned by the runtime user so writes don't fail.
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
