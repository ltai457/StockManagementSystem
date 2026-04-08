# DigitalOcean Droplet Deploy

This project can run cleanly on one droplet with:

- frontend static files served by nginx
- ASP.NET API behind nginx on `127.0.0.1:5128`
- uploaded images served from `/var/www/stock-app/uploads`
- PostgreSQL either on the same droplet or managed externally

## Recommended paths

```text
/var/www/stock-app/
  frontend/dist/         # built Vite app
  backend/               # published ASP.NET output
  uploads/               # persistent image storage
```

## 1. Build locally

Frontend env:

```env
VITE_API_BASE=https://your-domain.com/api/v1
VITE_DEBUG=false
```

Build commands:

```bash
cd Frontend-radiator-main
npm install
npm run build

cd ../MyBusinessBackend-main
dotnet publish -c Release -o ../deploy/publish
```

## 2. Copy files to droplet

```bash
scp -r Frontend-radiator-main/dist root@your-droplet-ip:/var/www/stock-app/frontend/
scp -r deploy/publish root@your-droplet-ip:/var/www/stock-app/backend/
scp deploy/nginx.stock-management.conf root@your-droplet-ip:/etc/nginx/sites-available/stock-management
scp deploy/stock-management-api.service root@your-droplet-ip:/etc/systemd/system/stock-management-api.service
```

Create the uploads directory on the droplet:

```bash
mkdir -p /var/www/stock-app/uploads
chown -R www-data:www-data /var/www/stock-app
```

## 3. Enable nginx site

```bash
ln -s /etc/nginx/sites-available/stock-management /etc/nginx/sites-enabled/stock-management
nginx -t
systemctl reload nginx
```

Update `server_name` in [`nginx.stock-management.conf`](/Users/lk333/Desktop/StockManagementSystem/deploy/nginx.stock-management.conf) before enabling it.

## 4. Configure backend service

Edit the environment values in [`stock-management-api.service`](/Users/lk333/Desktop/StockManagementSystem/deploy/stock-management-api.service):

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT__Secret`
- `ALLOWED_ORIGINS`

Then enable the service:

```bash
systemctl daemon-reload
systemctl enable stock-management-api
systemctl restart stock-management-api
systemctl status stock-management-api
```

## 5. Optional HTTPS with Certbot

```bash
apt update
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

After HTTPS is enabled, keep:

```env
VITE_API_BASE=https://your-domain.com/api/v1
ALLOWED_ORIGINS=https://your-domain.com
```

## 6. Smoke test

Open:

- `https://your-domain.com`
- `https://your-domain.com/health`

Check image URLs directly:

- `https://your-domain.com/uploads/radiators/<file-name>`

If the app loads but images do not:

- confirm backend writes to `/var/www/stock-app/uploads`
- confirm nginx `location /uploads/` points to the same directory
- confirm uploaded DB values look like `/uploads/radiators/<file>`
- confirm the frontend was built with the correct `VITE_API_BASE`
