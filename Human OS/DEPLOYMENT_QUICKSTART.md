# Quick Deployment Guide

## TL;DR - Deploy on Remote Server

On your remote server, run:

```bash
cd /opt/Human/Human\ OS

# Option 1: Auto-detect IP (recommended)
sudo ./docker-start.sh

# Option 2: Manual with specific IP
echo "VITE_API_URL=http://192.168.1.117:8080/api/v1" | sudo tee .env
sudo docker compose up -d --build
```

## Understanding the .env Files

### Root `.env` (Backend + Docker Compose)

Located at: `Human OS/.env`

**Purpose:**
- Backend configuration (PORT, ENV, LOG_LEVEL, DATABASE_PATH)
- **Docker deployment only:** `VITE_API_URL` for frontend builds

**When to set `VITE_API_URL` here:**
- ✅ Docker deployment on remote server
- ❌ NOT needed for local development

**Example for Docker deployment:**
```bash
# Backend Configuration
PORT=8080
ENV=production
LOG_LEVEL=info
DATABASE_PATH=/app/data/humanOS.db

# Frontend Configuration (for Docker builds)
VITE_API_URL=http://192.168.1.117:8080/api/v1
```

**Example for local development:**
```bash
# Backend Configuration
PORT=8080
ENV=development
LOG_LEVEL=debug
DATABASE_PATH=./humanOS.db

# VITE_API_URL not needed (frontend/.env is used)
```

### Frontend `.env`

Located at: `Human OS/frontend/.env`

**Purpose:**
- Frontend API URL for local development only

**When used:**
- ✅ Local development (npm run dev)
- ❌ NOT used in Docker builds (overridden by root .env)

**Content:**
```bash
VITE_API_URL=http://localhost:8080/api/v1
```

## How It Works

### Local Development (`npm run dev`)

```
You run: npm run dev in frontend/
Frontend reads: frontend/.env
API URL: http://localhost:8080/api/v1 ✓
```

### Docker Deployment

```
You run: docker compose up -d --build
Docker reads: .env (root)
Frontend built with: VITE_API_URL from root .env
API URL: http://YOUR_SERVER_IP:8080/api/v1 ✓
```

## Common Issues

### Issue: Frontend shows localhost errors in browser console

**Cause:** Frontend was built with `localhost` API URL

**Solution:** Rebuild with correct IP:
```bash
# Make sure .env has VITE_API_URL set
echo "VITE_API_URL=http://YOUR_IP:8080/api/v1" > .env
docker compose up -d --build  # --build is critical!
```

### Issue: `docker compose config` shows `localhost`

**Cause:** `.env` file doesn't have `VITE_API_URL`

**Solution:**
```bash
echo "VITE_API_URL=http://192.168.1.117:8080/api/v1" >> .env
```

### Issue: Running `./docker-start.sh` says "command not found"

**Cause:** Script needs executable permissions

**Solution:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

## Verification

After deployment, verify the API URL is correct:

```bash
# Check what docker compose will use
docker compose config | grep VITE_API_URL

# Check what's baked into the frontend
docker compose exec frontend grep -o "http://[^\"]*:8080" /usr/share/nginx/html/assets/*.js | head -1

# Should show your server's IP, not localhost!
```

## File Structure

```
Human OS/
├── .env                    # Backend config + VITE_API_URL for Docker
├── .env.example            # Template
├── docker-start.sh         # Auto-configures and starts Docker
├── compose.yaml            # Reads VITE_API_URL from .env
└── frontend/
    ├── .env                # Local dev only (localhost)
    └── .env.example        # Template
```

## Summary

| File | Used When | Contains |
|------|-----------|----------|
| `/.env` | Docker deployment | Backend config + `VITE_API_URL` |
| `/frontend/.env` | Local dev (npm) | `VITE_API_URL=localhost` |
| `/.env.example` | Template | All possible options |
| `/frontend/.env.example` | Template | Frontend options |
