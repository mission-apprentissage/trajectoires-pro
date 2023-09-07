ARG TRAJECTOIRES_PRO_ENV=production
#From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
# Install dependencies only when needed
FROM node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:16-alpine AS builder-production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

ARG METABASE_SECRET_KEY
ARG METABASE_SITE_URL
ARG METABASE_DASHBOARD_STATS_ID
ARG METABASE_DASHBOARD_STATS_DETAILS_ID
ARG EXPOSITION_API_BASE_URL
ARG EXPOSITION_API_KEY
ARG NEXT_PUBLIC_API_BASE_URL
ARG INTERNAL_SITE_HOST
ARG STATISTIQUES_SITE_HOST
ARG HOST_REWRITE

ENV HAS_PROXY true
ENV METABASE_SECRET_KEY $METABASE_SECRET_KEY
ENV METABASE_SITE_URL $METABASE_SITE_URL
ENV METABASE_DASHBOARD_STATS_ID $METABASE_DASHBOARD_STATS_ID
ENV METABASE_DASHBOARD_STATS_DETAILS_ID $METABASE_DASHBOARD_STATS_DETAILS_ID
ENV EXPOSITION_API_BASE_URL $EXPOSITION_API_BASE_URL
ENV EXPOSITION_API_KEY $EXPOSITION_API_KEY
ENV NEXT_PUBLIC_API_BASE_URL $NEXT_PUBLIC_API_BASE_URL
ENV INTERNAL_SITE_HOST $INTERNAL_SITE_HOST
ENV STATISTIQUES_SITE_HOST $STATISTIQUES_SITE_HOST
ENV HOST_REWRITE $HOST_REWRITE

RUN yarn build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1
ENV HAS_PROXY true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder-production /app/next.config.js ./
# COPY --from=builder-production /app/public ./public
COPY --from=builder-production /app/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder-production --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder-production --chown=nextjs:nodejs /app/.next/static ./.next/static


USER nextjs

EXPOSE 3000

ENV PORT 3000
CMD ["node", "server.js"]