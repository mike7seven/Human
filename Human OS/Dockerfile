# Backend Dockerfile - Go API with SQLite
# Multi-stage build for smaller final image

# ==================== Build Stage ====================
FROM golang:1.24-alpine AS builder

# Install build dependencies for CGO (required for SQLite)
RUN apk add --no-cache gcc musl-dev sqlite-dev

WORKDIR /app

# Copy go mod files first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary with CGO enabled (required for go-sqlite3)
RUN CGO_ENABLED=1 GOOS=linux go build -a -ldflags '-linkmode external -extldflags "-static"' -o human-os-api ./cmd/api

# ==================== Runtime Stage ====================
FROM alpine:3.19

# Install runtime dependencies
RUN apk add --no-cache ca-certificates sqlite-libs

WORKDIR /app

# Create directory for database
RUN mkdir -p /app/data

# Copy binary from builder
COPY --from=builder /app/human-os-api .

# Set environment variables
ENV PORT=8080
ENV ENV=production
ENV LOG_LEVEL=info
ENV DATABASE_PATH=/app/data/humanOS.db

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/dashboard/status || exit 1

# Run the application
CMD ["./human-os-api"]
