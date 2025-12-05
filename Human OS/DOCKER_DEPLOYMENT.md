# Docker Deployment Guide

This guide explains how to deploy Human OS using Docker on a remote server.

## Quick Start

### Option 1: Auto-detect Host IP (Recommended)

The easiest way to deploy is using the provided startup script, which automatically detects your server's IPv4 address:

```bash
./docker-start.sh
```

This will:
1. Detect your server's public/private IP address
2. Configure the frontend to use that IP for API calls
3. Start both backend and frontend containers

### Option 2: Set Domain/IP Manually

If you have a domain name or want to specify a specific IP:

```bash
export DOMAIN=your-domain.com  # or export DOMAIN=YOUR_SERVER_IP
./docker-start.sh
```

### Option 3: Use Docker Compose Directly

If you prefer to use docker compose directly:

```bash
# Create .env file with your server's IP or domain
echo "VITE_API_URL=http://YOUR_IP_OR_DOMAIN:8080/api/v1" > .env

# Start the services (--build is required to bake in the API URL)
docker compose up -d --build
```

## Understanding the Configuration

### The Problem with `localhost`

When running Docker containers, `localhost` inside a container refers to that specific container, not the host machine. This causes issues when:

- The frontend container tries to reach the backend at `localhost:8080`
- Your browser tries to reach the API at `localhost:8080` from a different machine

### The Solution

The frontend needs to know the **actual network address** of the server to make API calls. This is configured via the `VITE_API_URL` environment variable, which is baked into the frontend build.

The `docker-start.sh` script automatically:
1. Detects your server's IP address using multiple methods
2. Sets `VITE_API_URL=http://YOUR_IP:8080/api/v1`
3. Rebuilds the frontend with this configuration
4. Starts the containers

## Accessing the Application

After deployment, access the application at:

- **Frontend**: `http://YOUR_IP:3000`
- **Backend API**: `http://YOUR_IP:8080`

## Managing the Deployment

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
```

### Stop the Application

```bash
docker compose down
```

### Restart Services

```bash
docker compose restart
```

### Rebuild After Changes

If you make code changes, rebuild the containers:

```bash
docker compose up -d --build
```

Or use the startup script again:

```bash
./docker-start.sh
```

## Troubleshooting

### Frontend Can't Connect to Backend

**Symptoms**: Errors in browser console about network requests failing

**Solution**:
1. Check the API URL used by the frontend:
   ```bash
   docker compose exec frontend cat /usr/share/nginx/html/assets/*.js | grep -o 'http://[^"]*:8080'
   ```
2. Verify this URL is accessible from your browser
3. If incorrect, rebuild with the correct `VITE_API_URL`:
   ```bash
   export VITE_API_URL=http://CORRECT_IP:8080/api/v1
   docker compose up -d --build
   ```

### Auto-detection Fails

**Symptoms**: `docker-start.sh` says "Could not detect host IP address"

**Solution**: Manually set the DOMAIN variable:
```bash
export DOMAIN=YOUR_SERVER_IP  # Your server's IP address
./docker-start.sh
```

### Port Already in Use

**Symptoms**: Docker fails to start, says port 3000 or 8080 is in use

**Solution**:
1. Check what's using the port:
   ```bash
   sudo lsof -i :3000
   sudo lsof -i :8080
   ```
2. Either stop that service or change the port mapping in [compose.yaml](compose.yaml)

## Production Considerations

### Using a Domain Name

If you have a domain pointing to your server:

```bash
export DOMAIN=humanOS.yourdomain.com
./docker-start.sh
```

### HTTPS/SSL

For production, you should:
1. Use a reverse proxy (nginx, Caddy, Traefik)
2. Configure SSL certificates (Let's Encrypt)
3. Update the `VITE_API_URL` to use `https://`

Example nginx configuration:
```nginx
server {
    listen 80;
    server_name humanOS.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name humanOS.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/humanOS.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/humanOS.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Persistent Data

The database is stored in a Docker volume (`human-os-data`). To backup:

```bash
# Create backup
docker compose exec backend sqlite3 /app/data/humanOS.db ".backup '/app/data/backup.db'"
docker compose cp backend:/app/data/backup.db ./humanOS-backup-$(date +%Y%m%d).db

# Restore backup
docker compose cp ./humanOS-backup.db backend:/app/data/humanOS.db
docker compose restart backend
```

## Network Configuration

Both services run on a custom bridge network (`human-os-network`):
- Services can reach each other using service names (e.g., `backend:8080`)
- External access is via mapped ports (3000, 8080)

Port mapping:
- `3000:3000` - Frontend (Host:Container)
- `8080:8080` - Backend API (Host:Container)

## Security Notes

1. **Firewall**: Ensure ports 3000 and 8080 are open in your firewall
2. **Environment Variables**: Never commit `.env` files with sensitive data
3. **Database**: The SQLite database is persisted in a Docker volume
4. **Updates**: Regularly update the Docker images and rebuild:
   ```bash
   docker compose pull
   docker compose up -d --build
   ```
