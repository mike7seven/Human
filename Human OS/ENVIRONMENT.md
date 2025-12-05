# Environment Configuration Guide

## Overview

Human OS supports two environments: `development` and `production`. The environment is controlled via the `ENV` variable in your `.env` file.

## Environment Variables

### Required for All Environments

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | Server port | `8080` | `8080`, `3001` |
| `ENV` | Environment mode | `development` | `development`, `production` |
| `LOG_LEVEL` | Logging verbosity | `info` | `debug`, `info`, `warn`, `error` |
| `DATABASE_PATH` | SQLite database file path | `./humanOS.db` | `./humanOS.db`, `/app/data/humanOS.db` |

### Docker Deployment Only

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Frontend API endpoint | Yes (Docker) | `http://YOUR_SERVER_IP:8080/api/v1` |

## Environment Differences

### Development Mode (`ENV=development`)

**Use Case:** Local development, debugging, testing

**Characteristics:**
- More verbose logging available (`debug` level)
- CORS allows all origins (`*`)
- Database typically local file (`./humanOS.db`)
- Frontend connects to `localhost:8080`
- Detailed error messages

**Configuration:**
```bash
PORT=8080
ENV=development
LOG_LEVEL=debug
DATABASE_PATH=./humanOS.db
```

### Production Mode (`ENV=production`)

**Use Case:** Deployed servers, Docker containers, production systems

**Characteristics:**
- Optimized logging (`info` or `warn` level)
- CORS should be configured for specific origins (currently allows all, should be hardened)
- Database in persistent volume (`/app/data/humanOS.db`)
- Frontend connects to server IP/domain
- Minimal error exposure

**Configuration:**
```bash
PORT=8080
ENV=production
LOG_LEVEL=info
DATABASE_PATH=/app/data/humanOS.db
VITE_API_URL=http://your-server-ip:8080/api/v1
```

## Configuration Methods

### Method 1: Automatic (Recommended for Docker)

Use the `docker-start.sh` script which automatically:
- Detects your server's IP address
- Sets `ENV=production`
- Configures `VITE_API_URL`
- Sets appropriate paths for Docker

```bash
./docker-start.sh
```

This generates:
```bash
# .env (generated)
VITE_API_URL=http://YOUR_DETECTED_SERVER_IP:8080/api/v1
PORT=8080
ENV=production
LOG_LEVEL=info
DATABASE_PATH=/app/data/humanOS.db
```

### Method 2: Manual Configuration

Edit `.env` file directly:

**For local development:**
```bash
cp .env.example .env
# Edit .env to set ENV=development
```

**For Docker deployment:**
```bash
cat > .env <<EOF
PORT=8080
ENV=production
LOG_LEVEL=info
DATABASE_PATH=/app/data/humanOS.db
VITE_API_URL=http://YOUR_SERVER_IP:8080/api/v1
EOF
```

## Log Levels

| Level | When to Use | What Gets Logged |
|-------|-------------|------------------|
| `debug` | Development, troubleshooting | Everything including internal state, SQL queries, etc. |
| `info` | Production (default) | Important operations, API requests, system events |
| `warn` | Production (strict) | Warnings and errors only |
| `error` | Production (minimal) | Errors only |

## Database Paths

### Local Development
```bash
DATABASE_PATH=./humanOS.db
```
- Database stored in project root
- Easy to inspect and reset
- Not persistent across container rebuilds

### Docker Production
```bash
DATABASE_PATH=/app/data/humanOS.db
```
- Database stored in Docker volume `human-os-data`
- Persists across container restarts and rebuilds
- Requires volume backup for data safety

## Security Considerations

### Development
- ✅ Allow all CORS origins for easy testing
- ✅ Verbose logging for debugging
- ✅ Local file paths
- ❌ NOT suitable for public access

### Production
- ⚠️ **TODO:** Configure CORS for specific trusted origins only
- ✅ Minimal logging to avoid exposing internals
- ✅ Secure database in persistent volume
- ✅ Use HTTPS in production (reverse proxy recommended)

## Common Scenarios

### Scenario 1: Local Development (Go + React dev servers)

**Backend `.env`:**
```bash
PORT=8080
ENV=development
LOG_LEVEL=debug
DATABASE_PATH=./humanOS.db
```

**Frontend `.env`:**
```bash
VITE_API_URL=http://localhost:8080/api/v1
```

**Commands:**
```bash
# Terminal 1 - Backend
go run cmd/api/main.go

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Scenario 2: Docker on Remote Server

**Root `.env`:**
```bash
PORT=8080
ENV=production
LOG_LEVEL=info
DATABASE_PATH=/app/data/humanOS.db
VITE_API_URL=http://YOUR_SERVER_IP:8080/api/v1
```

**Commands:**
```bash
# Automatic
./docker-start.sh

# Or manual
docker compose up -d --build
```

### Scenario 3: Docker with Domain Name

**Root `.env`:**
```bash
PORT=8080
ENV=production
LOG_LEVEL=info
DATABASE_PATH=/app/data/humanOS.db
VITE_API_URL=https://api.humanOS.com/api/v1
```

**Additional:** Set up reverse proxy (nginx/Caddy) for HTTPS

## Verification

### Check Current Configuration

```bash
# View compose configuration
docker compose config

# Check what environment backend sees
docker compose logs backend | grep Environment

# Check frontend API URL
docker compose exec frontend grep -o "http://[^\"]*:8080" /usr/share/nginx/html/assets/*.js | head -1
```

### Test Environment

```bash
# Test backend health
curl http://localhost:8080/health

# Test API endpoint
curl http://localhost:8080/api/v1/dashboard/status

# Check CORS headers
curl -I -X OPTIONS http://localhost:8080/api/v1/dashboard/status
```

## Troubleshooting

### Problem: Backend shows development mode in Docker

**Solution:** Check `.env` has `ENV=production`
```bash
cat .env | grep ENV
docker compose down && docker compose up -d
```

### Problem: Frontend can't reach backend

**Solution:** Verify `VITE_API_URL` is set correctly
```bash
# Check what's configured
docker compose config | grep VITE_API_URL

# Should show your server IP, not localhost
# If wrong, update .env and rebuild:
echo "VITE_API_URL=http://YOUR_IP:8080/api/v1" >> .env
docker compose up -d --build
```

### Problem: Database resets every deployment

**Solution:** Check database path uses Docker volume
```bash
# Should be /app/data/humanOS.db for Docker
docker compose config | grep DATABASE_PATH

# Verify volume exists
docker volume ls | grep human-os-data

# Check volume contents
docker compose exec backend ls -la /app/data/
```

## Best Practices

1. **Never commit `.env`** - It contains deployment-specific configuration
2. **Use `.env.example`** as template - Copy and modify for your environment
3. **Production = production** - Always use `ENV=production` for deployed systems
4. **Separate configs** - Keep development and production configs separate
5. **Document changes** - Update `.env.example` when adding new variables
6. **Secure in production** - Use HTTPS, configure CORS properly, minimize logging
7. **Backup database** - Regularly backup the Docker volume in production

## Future Enhancements

- [ ] Environment-specific CORS configuration
- [ ] Secrets management for sensitive values
- [ ] Multiple database support (PostgreSQL, MySQL)
- [ ] Environment-specific rate limiting
- [ ] Structured logging in production
- [ ] Metrics and observability configuration
