# syntax=docker/dockerfile:1.7
# -----------------------------------------------------------------------------
# n-rainhas-spa — multi-stage build for self-hosted deploys (K3s, Docker, etc.)
# Image is NOT used by the GitHub Pages workflow. Kept here for VPS scenarios.
# -----------------------------------------------------------------------------

# ----- Stage 1: build the Angular bundle with pnpm ---------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Enable Corepack so pnpm@9.15.0 (matched in package.json packageManager)
# is installed deterministically.
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Install dependencies first to leverage Docker layer caching.
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the source tree.
COPY . .

# Allow the consumer to override the public base href at build time.
# Default is '/' (root) for self-hosted deployments.
ARG BASE_HREF=/
RUN pnpm build --configuration production --base-href=${BASE_HREF}

# ----- Stage 2: serve static assets with nginx -------------------------------
FROM nginx:1.27-alpine AS runtime

# Drop the default site config and copy our own.
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built browser bundle.
COPY --from=build /app/dist/n-rainhas/browser /usr/share/nginx/html

# Run as the unprivileged nginx user provided by the base image.
USER nginx

EXPOSE 8080

# Healthcheck pings the static index — exits non-zero if nginx is unreachable.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
