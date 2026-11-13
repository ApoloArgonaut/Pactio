# ==============================================================================
# PACTIO - PRODUCTION DOCKERFILE (MULTI-STAGE)
# Lightweight, secure, reproducible static bundle with Alpine Nginx
# ==============================================================================

# ---- Stage 1: Build Application ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build && npx vite build

# ---- Stage 2: Production Nginx Server ----
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing & gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
