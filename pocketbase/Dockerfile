# Production Dockerfile for Pocketbase
FROM alpine:latest

# Install required packages
RUN apk add --no-cache ca-certificates tzdata sqlite && \
    addgroup -g 1001 -S pocketbase && \
    adduser -u 1001 -S -G pocketbase pocketbase

# Create necessary directories
RUN mkdir -p /pb/pb_data /pb/pb_public /pb/pb_hooks /pb/pb_migrations

# Copy the existing pocketbase binary
COPY --chown=pocketbase:pocketbase ./pocketbase /pb/pocketbase
RUN chmod +x /pb/pocketbase

# Copy pb_hooks and ensure proper permissions
COPY --chown=pocketbase:pocketbase ./pb_hooks /pb/pb_hooks

# Copy existing data (for initial deployment, but volumes will override)
COPY --chown=pocketbase:pocketbase ./pb_data /pb/pb_data

# Set ownership of all pb directories
RUN chown -R pocketbase:pocketbase /pb

# Switch to non-root user
USER pocketbase
WORKDIR /pb

# Expose port
EXPOSE 8080

# Set up volumes for persistent data
VOLUME ["/pb/pb_data", "/pb/pb_public"]

# Enable SQLite optimizations
ENV SQLITE_TMPDIR=/pb/pb_data/tmp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Default command
ENTRYPOINT ["/pb/pocketbase"]
CMD ["serve", "--http=0.0.0.0:8080"]