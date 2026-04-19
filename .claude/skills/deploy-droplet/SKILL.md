---
name: deploy-droplet
description: Manually deploy the Radiator Stock Management System (ASP.NET 8 API + React/Vite frontend) to the production DigitalOcean droplet at 157.245.206.102 over SSH. Use when the user says "deploy", "ship to droplet", "push to prod", "redeploy", or asks to build and copy the frontend or backend to the server. There is no CI/CD — every step is run by hand.
---

# Deploy Radiator Stock System to the production droplet

This skill walks through manual deploys to **`http://157.245.206.102`** (Chan Mary 333). The full reference recipe lives at `deploy/deploy-droplet.md` — read it once at the start of any deploy task.

## When this skill applies

- "Deploy", "redeploy", "ship to droplet", "push to prod"
- "Rebuild the frontend and copy it up"
- "The API has new changes, restart the service"
- First-time setup of a brand new droplet
- Adding HTTPS, configuring nginx, configuring the systemd service
- Anything that changes files under `/var/www/radiator/` or `/home/deploy/api/` on the droplet

## The actual production layout (memorize this)

| Thing | Where / value |
|---|---|
| Droplet IP | `157.245.206.102` (HTTP only, no domain, no HTTPS) |
| Frontend dist | `/var/www/radiator/` |
| Backend bundle | `/home/deploy/api/` |
| Backend port | `127.0.0.1:5000` |
| systemd unit | `radiator-api.service` (user `deploy`) |
| Backend env file | `/home/deploy/api/.env` (loaded by DotNetEnv) |
| Uploads dir | `/home/deploy/api/wwwroot/uploads/radiators/` |
| nginx site | `/etc/nginx/sites-available/radiator` |
| Database | PostgreSQL on the same droplet, db `radiatorstockdb`, user `radiator_user` |

If a user message implies a *different* layout (e.g. `/var/www/stock-app`, port `5128`, `stock-management-api` service), they're working from a stale doc. Stop and confirm — do not invent paths.

## Before doing anything

1. **Read `deploy/deploy-droplet.md`** — source of truth for paths, commands, env keys, and the exact systemd/nginx config in production.
2. **Ask the user which scenario this is** if not obvious:
   - frontend-only redeploy (most common)
   - backend-only redeploy
   - full redeploy (frontend then backend)
   - infra change (nginx, systemd, postgres, .env)
   - first-time droplet setup (rare)
3. **Confirm the current branch.** The `DigitalOcean` branch is the deployment-tracking branch. If on a feature branch, flag it before building.
4. **Confirm there are no uncommitted secret-bearing changes** in `deploy/radiator-api.service` or `deploy/env.example` before any commit.

## Critical rules

- **Never run `ssh` or `scp` commands without first showing them to the user and getting an OK.** Live server with real customer data (Chan Mary 333). Print the exact command, wait for approval, then run.
- **Never run destructive remote commands** (`rm -rf` outside `/tmp`, `DROP DATABASE`, `ufw disable`, deleting `wwwroot` or `.env`) without explicit confirmation in the same message.
- **Never overwrite `/home/deploy/api/.env` or `/home/deploy/api/wwwroot/`** during a backend redeploy. Always rsync with `--exclude=".env" --exclude="wwwroot"`. Losing either is unrecoverable (real DB password, real uploaded photos).
- **Never commit secrets.** `JWT__Secret`, `DB_PASSWORD`, real `ALLOWED_ORIGINS` values stay only in `/home/deploy/api/.env` on the droplet. The repo has `deploy/env.example` with placeholders.
- **`VITE_API_BASE` is baked at build time.** If the host or scheme changes, frontend MUST be rebuilt. Backend-only redeploy will not pick this up.
- **Migrations run automatically on API startup** (`context.Database.Migrate()` in `Program.cs`). Never tell the user to run `dotnet ef database update` on the droplet. After restart, tail `journalctl -u radiator-api -f` to confirm.
- **Frontend changes do NOT need a service restart.** Only `scp` the new `dist/` and hard-refresh.
- **Backend changes need `systemctl restart radiator-api`** after the publish output is in place.
- **`UPLOADS_ROOT_PATH` must be a non-empty absolute path** in `.env`. If empty, the static file middleware ends up rooted at `/home/deploy/api` and serves `appsettings.json`, `RadiatorStockAPI.dll`, etc. publicly. This was a real security bug found and fixed on 2026-04-08.

## The standard redeploy flow (90% case)

### Frontend only

```bash
cd Frontend-radiator-main
npm run build
scp -r dist/* root@157.245.206.102:/var/www/radiator/
```

Tell the user to hard-refresh (`Cmd+Shift+R`).

### Backend only

```bash
cd MyBusinessBackend-main
dotnet publish -c Release -o ../deploy/publish

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
ssh root@157.245.206.102 'journalctl -u radiator-api -n 60 --no-pager'
```

### Both

Frontend first, then backend. New API live before new bundle starts hitting it.

## First-time droplet setup

If brand new, do not improvise — walk through `deploy/deploy-droplet.md` "First-time droplet setup" section in order. Before starting, collect all of these in one `AskUserQuestion` call:

- droplet IP
- whether HTTP-only or domain+HTTPS
- DB password to use (or "generate one")
- whether they have SSH key access

## Verification after every deploy

ALWAYS suggest these three checks in this order:

1. `curl -sf http://157.245.206.102/health` — API is up
2. Open `http://157.245.206.102` in a browser, log in, view inventory page — frontend loaded, auth works, images render
3. `ssh root@157.245.206.102 'journalctl -u radiator-api -n 50 --no-pager'` — no errors, migrations applied cleanly

Plus, if image-related work was deployed:

```bash
curl -sI http://157.245.206.102/uploads/appsettings.json | head -1   # MUST be 404
curl -sI http://157.245.206.102/uploads/RadiatorStockAPI.dll | head -1   # MUST be 404
```

If either returns 200, `UPLOADS_ROOT_PATH` is misconfigured — see the security note in `deploy/deploy-droplet.md`.

## Files this skill touches

| File | Purpose | Edit when |
|---|---|---|
| `deploy/deploy-droplet.md` | Full reference recipe | Process changes, new step, new dependency, layout drift on the real droplet |
| `deploy/nginx.radiator.conf` | Mirror of `/etc/nginx/sites-available/radiator` | Adding routes, tightening headers, changing the uploads proxy |
| `deploy/radiator-api.service` | Mirror of `/etc/systemd/system/radiator-api.service` (no secrets) | Changing the service user, working dir, dotnet entry, restart policy |
| `deploy/env.example` | Template for `/home/deploy/api/.env` keys | Adding a new env var the backend reads |
| `Frontend-radiator-main/.env.production` | Build-time API base for prod bundle | Host/scheme change — **rebuild required** |

The real `/home/deploy/api/.env` lives only on the droplet. Edit it in place over SSH. Never copy it back into the repo.

## What NOT to do

- Do not suggest GitHub Actions, App Platform, or any auto-deploy pipeline unless the user explicitly asks. They have chosen manual deploys.
- Do not suggest Docker / docker-compose. The deployment model is bare-metal systemd + nginx.
- Do not run `dotnet ef migrations add` as part of a deploy. Migrations must be committed before the deploy starts. If a migration is missing, stop and tell the user.
- Do not edit `appsettings.Production.json` to put real secrets. All secrets come from `/home/deploy/api/.env`.
- Do not change the systemd service user (`deploy`). The uploads dir and `.env` are owned by it.
- Do not push files to the doc layout (`/var/www/stock-app/...`). That layout does not exist on this droplet — it's leftover from an outdated version of the doc.
