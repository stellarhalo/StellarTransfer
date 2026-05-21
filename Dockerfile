FROM node:22-alpine AS frontend-deps
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS frontend-build
WORKDIR /build/frontend
COPY frontend ./
COPY --from=frontend-deps /build/frontend/node_modules ./node_modules
RUN npm run build

FROM node:22-alpine AS backend-deps
RUN apk add --no-cache python3 make g++ pkgconfig pixman-dev cairo-dev pango-dev
WORKDIR /build/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS backend-build
RUN apk add --no-cache openssl
WORKDIR /build/backend
COPY backend ./
COPY --from=backend-deps /build/backend/node_modules ./node_modules
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=docker
ENV PORT=3333
ENV BACKEND_PORT=8080
ENV HOSTNAME=0.0.0.0
ENV DATA_DIRECTORY=/opt/app/backend/data
ENV DATABASE_URL=file:/opt/app/backend/data/stellartransfer.db?connection_limit=1

RUN deluser --remove-home node && \
    apk add --no-cache caddy curl openssl su-exec

WORKDIR /opt/app

COPY reverse-proxy ./reverse-proxy
COPY scripts/docker ./scripts/docker

WORKDIR /opt/app/frontend
COPY --from=frontend-build /build/frontend/public ./public
COPY --from=frontend-build /build/frontend/.next/standalone ./
COPY --from=frontend-build /build/frontend/.next/static ./.next/static
COPY --from=frontend-build /build/frontend/public/img /tmp/stellartransfer-img

WORKDIR /opt/app/backend
COPY --from=backend-build /build/backend/dist ./dist
COPY --from=backend-build /build/backend/node_modules ./node_modules
COPY --from=backend-build /build/backend/package.json ./
COPY --from=backend-build /build/backend/prisma ./prisma

WORKDIR /opt/app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD sh -c 'if [ "$CADDY_DISABLED" = "true" ]; then curl -fs "http://127.0.0.1:${BACKEND_PORT}/api/health"; else curl -fs http://127.0.0.1:3000/api/health; fi'

ENTRYPOINT ["sh", "./scripts/docker/create-user.sh"]
CMD ["sh", "./scripts/docker/entrypoint.sh"]
