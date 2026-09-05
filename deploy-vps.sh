#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "🚀 SPORTA PLATFORM - PRODUCTION SETUP SCRIPT FOR VPS"
echo "🌐 Domain: sportaa.tech | IP: 31.97.188.235"
echo "=========================================================="

# 1. Update system & install dependencies
echo "[1/6] Updating system packages..."
apt update && apt upgrade -y
apt install -y docker.io docker-compose git nginx certbot python3-certbot-nginx ufw curl

# Enable and start Docker & Nginx
systemctl enable docker
systemctl start docker
systemctl enable nginx
systemctl start nginx

# 2. Setup Firewall
echo "[2/6] Configuring UFW Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 3. Create Web directories
echo "[3/6] Creating web root directories..."
mkdir -p /var/www/sportaa-admin
mkdir -p /var/www/sportaa-owner
mkdir -p /var/www/sportaa-landing

# Copy landing page if present
if [ -f "./landing/index.html" ]; then
    cp ./landing/index.html /var/www/sportaa-landing/index.html
fi

# 4. Copy Nginx Configuration
echo "[4/6] Setting up Nginx configuration..."
if [ -f "./nginx/sportaa.tech.conf" ]; then
    cp ./nginx/sportaa.tech.conf /etc/nginx/sites-available/sportaa.tech.conf
    ln -sf /etc/nginx/sites-available/sportaa.tech.conf /etc/nginx/sites-enabled/sportaa.tech.conf
    rm -f /etc/nginx/sites-enabled/default || true
    nginx -t
    systemctl reload nginx
fi

# 5. Start Backend and PostgreSQL
echo "[5/6] Building and starting Backend (Spring Boot 4) & PostgreSQL 15..."
if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml down || true
    docker-compose -f docker-compose.prod.yml up -d --build
fi

echo "=========================================================="
echo "🎉 Backend & Services are running!"
echo "👉 Next step: Run SSL certificate generation with Certbot:"
echo "   certbot --nginx -d sportaa.tech -d www.sportaa.tech -d api.sportaa.tech -d admin.sportaa.tech -d owner.sportaa.tech"
echo "=========================================================="
