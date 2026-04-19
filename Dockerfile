# ══════════════════════════════════════════════
# MaterialFlow AI — Production Dockerfile
# Multi-stage build: build frontend + run server
# ══════════════════════════════════════════════

# ── Stage 1: Build Frontend ──
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (better layer caching)
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Build production frontend
RUN npm run build

# ── Stage 2: Production Runtime ──
FROM node:20-alpine AS production

WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy dependency manifests and install production-only deps
COPY package.json package-lock.json* ./
RUN npm ci --production --no-audit --no-fund && npm cache clean --force

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy server code
COPY server/ ./server/

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start server
CMD ["node", "server/index.js"]
