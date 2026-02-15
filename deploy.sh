#!/bin/bash
set -e

DOMAIN="riseupprepsacademy.com"
EMAIL="admin@riseupprepsacademy.com"
APP_DIR="/opt/riseuppreps"

echo "========================================="
echo "  RiseUp Preps Academy - VPS Deployment"
echo "========================================="

# ---- Step 1: Install Docker if not present ----
if ! command -v docker &> /dev/null; then
    echo ""
    echo "[1/6] Installing Docker..."
    apt-get update
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo "Docker installed successfully."
else
    echo ""
    echo "[1/6] Docker already installed. Skipping."
fi

# ---- Step 2: Install Git if not present ----
if ! command -v git &> /dev/null; then
    echo ""
    echo "[2/6] Installing Git..."
    apt-get install -y git
else
    echo ""
    echo "[2/6] Git already installed. Skipping."
fi

# ---- Step 3: Clone or update the repo ----
echo ""
echo "[3/6] Setting up application..."
if [ -d "$APP_DIR" ]; then
    echo "App directory exists. Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://github.com/muzamil-rashdi/riseuppreps.git "$APP_DIR"
    cd "$APP_DIR"
fi

# ---- Step 4: Set up environment file ----
echo ""
echo "[4/6] Setting up environment..."
if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.production" "$APP_DIR/.env"
    echo ".env created from .env.production"
    echo ">>> IMPORTANT: Edit $APP_DIR/.env with your actual passwords before continuing!"
else
    echo ".env already exists. Skipping."
fi

# ---- Step 5: Get SSL certificate ----
echo ""
echo "[5/6] Setting up SSL certificate..."

# Check if certs already exist
if docker volume inspect rupa_certbot_etc &> /dev/null && \
   docker run --rm -v rupa_certbot_etc:/etc/letsencrypt alpine test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem 2>/dev/null; then
    echo "SSL certificate already exists. Skipping."
else
    echo "Obtaining SSL certificate for $DOMAIN..."

    # Use the init nginx config (HTTP only, for certbot challenge)
    cp "$APP_DIR/nginx/nginx.init.conf" "$APP_DIR/nginx/nginx.temp.conf"

    # Start nginx with temp config for certbot verification
    docker compose -f docker-compose.prod.yml run -d --name rupa-nginx-temp \
        -p 80:80 \
        -v "$APP_DIR/nginx/nginx.temp.conf:/etc/nginx/conf.d/default.conf:ro" \
        -v rupa_certbot_webroot:/var/www/certbot \
        nginx nginx -g 'daemon off;' 2>/dev/null || true

    # Wait for nginx to start
    sleep 3

    # Request SSL certificate
    docker run --rm \
        -v rupa_certbot_etc:/etc/letsencrypt \
        -v rupa_certbot_var:/var/lib/letsencrypt \
        -v rupa_certbot_webroot:/var/www/certbot \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN" \
        -d "www.$DOMAIN"

    # Stop temporary nginx
    docker stop rupa-nginx-temp 2>/dev/null || true
    docker rm rupa-nginx-temp 2>/dev/null || true
    rm -f "$APP_DIR/nginx/nginx.temp.conf"

    echo "SSL certificate obtained successfully!"
fi

# ---- Step 6: Build and start all services ----
echo ""
echo "[6/6] Building and starting application..."
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "========================================="
echo "  Deployment complete!"
echo "========================================="
echo ""
echo "  Your site is live at:"
echo "    https://$DOMAIN"
echo "    https://www.$DOMAIN"
echo ""
echo "  Useful commands:"
echo "    docker compose -f docker-compose.prod.yml logs -f        # View logs"
echo "    docker compose -f docker-compose.prod.yml ps             # Check status"
echo "    docker compose -f docker-compose.prod.yml down           # Stop all"
echo "    docker compose -f docker-compose.prod.yml up -d --build  # Rebuild & restart"
echo ""
