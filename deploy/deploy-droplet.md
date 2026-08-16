# DigitalOcean Droplet Deploy (Manual)

This is the actual production deployment for **`http://157.245.206.102`** (Chan Mary 333 stock system). There is no CI/CD — every change ships by hand over SSH from a developer Mac.

> **Read this whole file before touching the droplet.** Some of the paths and names look generic but are not — the running site has its own opinionated layout.

---

## Production layout (as it actually is on the droplet)

| Thing | Where / value |
|---|---|
| Public URL | `http://157.245.206.102` (HTTP only, no domain, no HTTPS) |
| OS | Ubuntu 24.04, root SSH via key |
| Frontend bundle | `/var/www/radiator/` (Vite `dist/` contents, served directly by nginx) |
| Backend bundle | `/home/deploy/api/` (`dotnet publish` output, run by systemd) |
| Backend DLL | `/home/deploy/api/RadiatorStockAPI.dll` |
| Backend port | `127.0.0.1:5000` (loopback only, fronted by nginx) |
| systemd unit | `radiator-api.service` (user `deploy`) |
| Backend env | `/home/deploy/api/.env` (loaded by DotNetEnv — see [`env.example`](./env.example)) |
| Uploaded images | `/home/deploy/api/wwwroot/uploads/radiators/` |
| nginx site | `/etc/nginx/sites-available/radiator` (symlinked into `sites-enabled/`) |
| PostgreSQL | Same droplet, db `radiatorstockdb`, user `radiator_user` |

The two repo files [`deploy/nginx.radiator.conf`](./nginx.radiator.conf) and [`deploy/radiator-api.service`](./radiator-api.service) are kept in sync with the real `/etc/nginx/sites-available/radiator` and `/etc/systemd/system/radiator-api.service` (with secrets stripped). If you change one, change the other.

---

## The 90% case — redeploying code changes

This is what you run almost every time. The droplet is already set up.

### Frontend only

```bash
cd Frontend-radiator-main
npm run build
scp -r dist/* root@157.245.206.102:/var/www/radiator/
```

No service restart needed — nginx serves the new files immediately. Hard-refresh the browser (`Cmd+Shift+R`).

### Backend only

```bash
cd MyBusinessBackend-main
dotnet publish -c Release -o ../deploy/publish

# Stage on the droplet, then sync into place preserving .env and wwwroot/
ssh root@157.245.206.102 'rm -rf /tmp/api-new && mkdir /tmp/api-new'
scp -r ../deploy/publish/* root@157.245.206.102:/tmp/api-new/

ssh root@157.245.206.102 '
  set -e
  systemctl stop radiator-api
  cp -a /home/deploy/api /home/deploy/api.bak.$(date +%s)
  rsync -a --exclude=".env" --exclude="wwwroot" /tmp/api-new/ /home/deploy/api/
  chown -R deploy:deploy /home/deploy/api
  systemctl start radiator-api
  sleep 3
  systemctl status radiator-api --no-pager | head -15
'
```

Then tail the logs to confirm a clean boot. This single-instance guide may use `RUN_MIGRATIONS_ON_STARTUP=true`; multi-instance production must apply migrations in one separate deployment job:

```bash
ssh root@157.245.206.102 'journalctl -u radiator-api -n 80 --no-pager'
```

### Both

Frontend first, then backend. That order means the new API is live by the time the new bundle starts calling it.

### Why we exclude `.env` and `wwwroot/` from the rsync

- `/home/deploy/api/.env` holds the real DB password, JWT secret, etc. It must never be overwritten by a `dotnet publish` output that doesn't contain it.
- `/home/deploy/api/wwwroot/uploads/` is the persistent image store. Wiping it would lose every uploaded radiator photo.

---

## Smoke test after every deploy

Always run these three. If any fail, jump to the troubleshooting section.

```bash
# 1. API is up
curl -sf http://157.245.206.102/health | head -c 200; echo

# 2. Uploaded images still serve (replace with any real filename)
ssh root@157.245.206.102 'ls /home/deploy/api/wwwroot/uploads/radiators/ | head -1'
curl -sI http://157.245.206.102/uploads/radiators/<that-filename> | head -3

# 3. Backend logs show clean startup, no migration errors
ssh root@157.245.206.102 'journalctl -u radiator-api -n 50 --no-pager'
```

Then in a real browser: hard-refresh the site, log in, open the inventory page, and confirm you can see existing images and upload a new one.

---

## First-time droplet setup (only for a brand new droplet)

You almost never do this. Skip to the next section if `radiator-api.service` is already running on the droplet.

### 1. Create the droplet

DigitalOcean → Create Droplet → Ubuntu 24.04 LTS, 2 GB RAM minimum, paste your SSH key. Note the public IP.

### 2. Base packages, firewall, swap

```bash
ssh root@<droplet-ip>
apt update && apt upgrade -y
apt install -y curl wget gnupg2 ca-certificates lsb-release ufw rsync

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 3. nginx, .NET 8 runtime, PostgreSQL

```bash
apt install -y nginx postgresql postgresql-contrib

wget https://packages.microsoft.com/config/ubuntu/24.04/packages-microsoft-prod.deb -O /tmp/ms.deb
dpkg -i /tmp/ms.deb
apt update
apt install -y aspnetcore-runtime-8.0
```

### 4. Create the deploy user, the database, and the directories

```bash
adduser --disabled-password --gecos "" deploy

sudo -u postgres psql <<'SQL'
CREATE USER radiator_user WITH PASSWORD 'CHANGE_ME_STRONG';
CREATE DATABASE radiatorstockdb OWNER radiator_user;
GRANT ALL PRIVILEGES ON DATABASE radiatorstockdb TO radiator_user;
SQL

mkdir -p /home/deploy/api/wwwroot/uploads/radiators
mkdir -p /var/www/radiator
chown -R deploy:deploy /home/deploy
chown -R www-data:www-data /var/www/radiator
```

### 5. Build locally on your Mac and ship

```bash
# Frontend
cd Frontend-radiator-main
cat > .env.production <<'ENV'
VITE_API_BASE=http://<droplet-ip>/api/v1
VITE_DEBUG=false
ENV
npm install && npm run build
scp -r dist/* root@<droplet-ip>:/var/www/radiator/

# Backend
cd ../MyBusinessBackend-main
dotnet publish -c Release -o ../deploy/publish
scp -r ../deploy/publish/* root@<droplet-ip>:/home/deploy/api/
ssh root@<droplet-ip> 'chown -R deploy:deploy /home/deploy/api'
```

### 6. Backend `.env`

Copy [`deploy/env.example`](./env.example) to the droplet and fill in real secrets:

```bash
scp deploy/env.example root@<droplet-ip>:/home/deploy/api/.env
ssh root@<droplet-ip> '
  chown deploy:deploy /home/deploy/api/.env
  chmod 600 /home/deploy/api/.env
  nano /home/deploy/api/.env   # set DB_PASSWORD, JWT__Secret, ALLOWED_ORIGINS
'
```

Generate the JWT secret with: `openssl rand -base64 48`

For this single-instance Droplet guide, set `RUN_MIGRATIONS_ON_STARTUP=true`. Do not use that setting when multiple API replicas can start concurrently; apply migrations once as a release step instead. For an empty database, also set all three `BOOTSTRAP_ADMIN_*` values for the first startup and remove them immediately afterward.

### 7. systemd unit

```bash
scp deploy/radiator-api.service root@<droplet-ip>:/etc/systemd/system/radiator-api.service
ssh root@<droplet-ip> '
  systemctl daemon-reload
  systemctl enable radiator-api
  systemctl start radiator-api
  sleep 3
  systemctl status radiator-api --no-pager
'
```

With `RUN_MIGRATIONS_ON_STARTUP=true`, migrations run on first boot. Watch `journalctl -u radiator-api -f` for a successful migration and startup, then remove the `BOOTSTRAP_ADMIN_*` variables if they were used.

### 8. nginx site

```bash
scp deploy/nginx.radiator.conf root@<droplet-ip>:/etc/nginx/sites-available/radiator
ssh root@<droplet-ip> '
  rm -f /etc/nginx/sites-enabled/default
  ln -sf /etc/nginx/sites-available/radiator /etc/nginx/sites-enabled/radiator
  nginx -t && systemctl reload nginx
'
```

If you point a real domain at the droplet later, also run:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d <domain> -d www.<domain>
```

…and rebuild the frontend with `VITE_API_BASE=https://<domain>/api/v1`, and update `ALLOWED_ORIGINS` in `/home/deploy/api/.env`, then restart `radiator-api`.

---

## Backups

Daily Postgres dump and weekly DO snapshots:

```bash
mkdir -p /var/backups/radiator
cat > /etc/cron.daily/radiator-db <<'CRON'
#!/bin/bash
TS=$(date +\%Y\%m\%d)
sudo -u postgres pg_dump radiatorstockdb | gzip > /var/backups/radiator/db-$TS.sql.gz
find /var/backups/radiator -name 'db-*.sql.gz' -mtime +14 -delete
CRON
chmod +x /etc/cron.daily/radiator-db
```

Also enable weekly droplet snapshots in the DigitalOcean control panel.

---

## Troubleshooting cheatsheet

| Symptom | Where to look |
|---|---|
| 502 Bad Gateway | `journalctl -u radiator-api -n 100` — API crashed or didn't start |
| API up but login fails | `JWT__Secret` is too short, or `ALLOWED_ORIGINS` doesn't match the URL the browser loaded the site from |
| CORS errors in browser console | `ALLOWED_ORIGINS` in `/home/deploy/api/.env`, then `systemctl restart radiator-api` |
| Migrations fail on boot | `journalctl -u radiator-api -n 200` — usually wrong DB creds in `.env` or DB doesn't exist |
| Images 404 / broken icon | nginx is missing the `location /uploads/` block, OR `UPLOADS_ROOT_PATH` is empty/relative (which exposes the whole working dir — see note below), OR the file isn't on disk |
| `/uploads/appsettings.json` returns 200 | **SECURITY BUG** — `UPLOADS_ROOT_PATH` resolved to `/home/deploy/api`. Set it to `/home/deploy/api/wwwroot/uploads` in `.env` and restart |
| `nginx -t` fails | Check the file you copied — `server_name` not set or duplicate `default_server` |
| Frontend changes don't appear | Browser cache. Hard-refresh `Cmd+Shift+R`. Or you forgot to rebuild before scp'ing |
| `VITE_API_BASE` is wrong (calls go to `localhost:5128`) | The frontend was built without `.env.production`. Recreate `Frontend-radiator-main/.env.production`, rebuild, scp again |

### The `UPLOADS_ROOT_PATH` security note

`MyBusinessBackend-main/Program.cs` resolves `UPLOADS_ROOT_PATH` like this:

```
env var → appsettings.json "Uploads:RootPath" → default "wwwroot/uploads"
```

If `appsettings.json` has `"Uploads": { "RootPath": "" }` (empty string, not null) and the env var is unset, the empty string wins, then `Path.Combine(ContentRootPath, "")` resolves to `ContentRootPath` itself = `/home/deploy/api`. The static file middleware then happily serves `/uploads/appsettings.json`, `/uploads/RadiatorStockAPI.dll`, etc.

**Always set `UPLOADS_ROOT_PATH` to a real absolute path in `.env`.** This is enforced by [`env.example`](./env.example).
