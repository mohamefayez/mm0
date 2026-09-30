FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV ASEL_DATA_DIR=/app/data
COPY --from=build --chown=node:node /app /app
RUN mkdir -p /app/data /app/.local && chown -R node:node /app/data /app/.local
USER node
EXPOSE 3000
CMD ["sh", "-c", "node --experimental-strip-types scripts/setup-store.mjs && node node_modules/next/dist/bin/next start --hostname 0.0.0.0"]
