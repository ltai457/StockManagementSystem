#!/bin/bash
# Complete Digital Ocean Deployment Script
# Run this to finish setting up your Radiator Stock API

set -e

echo "🚀 Completing Digital Ocean Deployment..."

# Step 1: Create systemd service
ssh -i ~/.ssh/radiator-stock-keypair root@143.198.198.90 << 'ENDSSH'
cat > /etc/systemd/system/radiatorstock.service << 'EOF'
[Unit]
Description=Radiator Stock API
After=network.target

[Service]
WorkingDirectory=/var/www/radiatorstock
ExecStart=/usr/bin/dotnet /var/www/radiatorstock/RadiatorStockAPI.dll
Restart=always
RestartSec=10
SyslogIdentifier=radiatorstock
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Systemd service created"

# Step 2: Install and configure Nginx
apt-get install -y nginx

cat > /etc/nginx/sites-available/radiatorstock << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/radiatorstock /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx

echo "✅ Nginx configured"

# Step 3: Set permissions
chown -R www-data:www-data /var/www/radiatorstock
chmod -R 755 /var/www/radiatorstock

echo "✅ Permissions set"

# Step 4: Start the service
systemctl daemon-reload
systemctl enable radiatorstock
systemctl start radiatorstock

sleep 3

# Step 5: Check status
systemctl status radiatorstock --no-pager

echo ""
echo "✅ Service started"

# Step 6: Test the API
echo ""
echo "🧪 Testing API..."
curl -s http://localhost/health | python3 -m json.tool || echo "Waiting for API..."
sleep 5
curl -s http://localhost/health | python3 -m json.tool

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Your API is now running at:"
echo "   http://143.198.198.90/health"
echo "   http://143.198.198.90/swagger"
echo ""
echo "📝 Next steps:"
echo "   1. Test the API endpoints"
echo "   2. (Optional) Set up a domain name"
echo "   3. (Optional) Configure SSL with Let's Encrypt"
echo ""
ENDSSH

echo "🎉 Deployment script completed!"
echo ""
echo "Your Radiator Stock API is now live at: http://143.198.198.90"
