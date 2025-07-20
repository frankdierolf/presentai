# Multi-stage build for Node.js/TypeScript Hono backend
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
FROM base AS dependencies
RUN npm ci --only=production

# Build stage
FROM base AS build
RUN npm ci
COPY . .

# Build the TypeScript application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install required system dependencies
RUN apk add --no-cache curl

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S hono -u 1001

# Set working directory
WORKDIR /app

# Copy built application and dependencies
COPY --from=dependencies --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=hono:nodejs /app/dist ./dist
COPY --from=build --chown=hono:nodejs /app/package.json ./

# Switch to non-root user
USER hono

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]