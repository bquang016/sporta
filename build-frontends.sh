#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "🏗️  BUILDING AND DEPLOYING WEB-ADMIN & WEB-OWNER"
echo "=========================================================="

# 1. Install Node.js 20 LTS if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# 2. Build Web Admin
echo "📦 Building Web Admin..."
cd /root/sporta-platform/web-admin
npm install
npm run build
mkdir -p /var/www/sportaa-admin
rm -rf /var/www/sportaa-admin/*
cp -r dist/* /var/www/sportaa-admin/
echo "✅ Web Admin deployed to /var/www/sportaa-admin"

# 3. Build Web Owner
echo "📦 Building Web Owner..."
cd /root/sporta-platform/web-owner
npm install
npm run build
mkdir -p /var/www/sportaa-owner
rm -rf /var/www/sportaa-owner/*
cp -r dist/* /var/www/sportaa-owner/
echo "✅ Web Owner deployed to /var/www/sportaa-owner"

# 4. Set permissions
chown -R www-data:www-data /var/www/sportaa-admin /var/www/sportaa-owner /var/www/sportaa-landing
chmod -R 755 /var/www/sportaa-admin /var/www/sportaa-owner /var/www/sportaa-landing

echo "=========================================================="
echo "🎉 SUCCESS! All frontends are live:"
echo "👉 Admin: https://admin.sportaa.tech"
echo "👉 Owner: https://owner.sportaa.tech"
echo "=========================================================="
