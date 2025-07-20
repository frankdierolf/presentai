# Production Dockerfile for Pocketbase
FROM alpine:latest

# Install required packages including wget for downloading PocketBase and curl for healthcheck
RUN apk add --no-cache ca-certificates tzdata sqlite wget unzip curl && \
    addgroup -g 1001 -S pocketbase && \
    adduser -u 1001 -S -G pocketbase pocketbase

# Create necessary directories
RUN mkdir -p /pb/pb_data /pb/pb_public /pb/pb_hooks /pb/pb_migrations

# Download and install PocketBase binary
ARG POCKETBASE_VERSION=0.29.0
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip -O /tmp/pocketbase.zip && \
    unzip /tmp/pocketbase.zip -d /tmp && \
    mv /tmp/pocketbase /pb/pocketbase && \
    chmod +x /pb/pocketbase && \
    rm /tmp/pocketbase.zip && \
    chown pocketbase:pocketbase /pb/pocketbase

# Copy pb_hooks and ensure proper permissions
COPY --chown=pocketbase:pocketbase ./pb_hooks /pb/pb_hooks

# Copy existing data (optional - volumes will override)
# Skip pb_data copy since it's mounted as a volume and may not exist during build

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
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:8080/api/health || exit 1

# Default command
ENTRYPOINT ["/pb/pocketbase"]
CMD ["serve", "--http=0.0.0.0:8080"]