# Stock Management Platform

Full-stack radiator inventory and warehouse management system for **Chan Mary 333**. Combines a React 19 + Vite SPA with an ASP.NET Core 8 REST API backed by PostgreSQL.

```
StockManagementSystem/
├─ Frontend-radiator-main/    # React SPA (Vite 7, Tailwind CSS 4)
├─ MyBusinessBackend-main/    # ASP.NET Core 8 Web API
├─ StockManagementSystem.sln  # Visual Studio solution
└─ *.sql                      # Database migration helper scripts
```

## Features

- **Role-based dashboards** -- Admins get user management; staff see inventory, stock, warehouses, and sales.
- **Stock tracking** -- Per-warehouse quantities, low-stock alerts (threshold: 10), movement history with full audit trail.
- **Stock operations** -- Inbound, outbound (sale), manual adjust, bulk update, and warehouse-to-warehouse transfers.
- **Radiator catalogue** -- CRUD with brand, code, pricing tiers (retail/trade/cost), discount rules, and optional S3 image uploads.
- **Warehouse management** -- Multi-warehouse support with address, contact info, and per-warehouse stock views.
- **Authentication** -- JWT access tokens (15 min) + refresh tokens (7 days), BCrypt password hashing, session warnings, auto-refresh.
- **Operational endpoints** -- `/health` (DB connectivity check), `/ping`, `/api/v1/info`, Swagger UI in development.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, React Router 7, Axios, MUI 7, Lucide/Heroicons |
| Backend | ASP.NET Core 8, Entity Framework Core 9, PostgreSQL 15+, JWT Bearer, BCrypt, DotNetEnv |
| Build | npm, .NET CLI, EF Core migrations, ESLint |

## Quick Start

### Prerequisites

- .NET 8 SDK
- Node.js 18+ / npm 9+
- PostgreSQL 15+

### 1. Backend

```bash
cd MyBusinessBackend-main
```

Create `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=radiatorstockdb
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=ReplaceWith32CharSecret
JWT_ISSUER=RadiatorStockAPI
JWT_AUDIENCE=RadiatorStockAPI-Users
ALLOWED_ORIGINS=http://localhost:5173
```

Run:

```bash
dotnet restore
dotnet ef database update   # Creates schema + seeds demo data
dotnet run                  # http://localhost:5128
```

Swagger UI: http://localhost:5128/swagger

### 2. Frontend

```bash
cd Frontend-radiator-main
```

Create `.env`:

```env
VITE_API_BASE=http://localhost:5128/api/v1
VITE_DEBUG=false
```

Run:

```bash
npm install
npm run dev    # http://localhost:5173
```

### 3. Default Credentials

| Role  | Username | Password   |
|-------|----------|------------|
| Admin | admin    | Admin123!  |
| Staff | staff1   | Staff123!  |

## API Endpoints

### Auth (`/api/v1/auth`)
`POST /login` | `POST /register` | `POST /refresh` | `POST /logout` | `POST /change-password` | `GET /me`

### Radiators (`/api/v1/radiators`) -- Auth required
`GET /` (paginated) | `GET /{id}` | `POST /` | `PUT /{id}` | `DELETE /{id}` (Admin)

### Warehouses (`/api/v1/warehouses`) -- Auth required
`GET /` | `GET /{id}` | `POST /` | `PUT /{id}` | `DELETE /{id}` (Admin)

### Stock (`/api/v1/stock`) -- Auth required
`GET /summary` | `GET /all-radiators` | `GET /low-stock` | `GET /out-of-stock` | `GET /warehouse/{code}` | `GET /movements` | `GET /history/{radiatorId}` | `POST /adjust` | `POST /in` | `POST /sell` | `POST /transfer` | `POST /bulk-update`

### Users (`/api/v1/users`) -- Admin only
`GET /` | `GET /{id}` | `POST /` | `PUT /{id}` | `DELETE /{id}` | `GET /check-username/{username}` | `GET /check-email/{email}`

### Ops (No auth)
`GET /health` | `GET /ping` | `GET /api/v1/info`

## Deployment

- **Backend**: Publish to Azure App Service, AWS ECS, DigitalOcean App Platform, or Docker. Set DB connection, JWT secrets, and `ALLOWED_ORIGINS` via environment variables. Use `SSL Mode=Require` for managed PostgreSQL.
- **Frontend**: `npm run build` outputs `dist/`. Deploy to Netlify, Vercel, S3+CloudFront, or DigitalOcean Apps. Set `VITE_API_BASE` to the production API URL before building.
- **Database**: Managed PostgreSQL recommended. Migrations run automatically on API startup.
- **Images**: Optional AWS S3 bucket for radiator images. IAM needs `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`.

## Project Documentation

- [`Frontend-radiator-main/README.md`](Frontend-radiator-main/README.md) -- Frontend scripts, structure, and troubleshooting
- [`MyBusinessBackend-main/README.md`](MyBusinessBackend-main/README.md) -- Backend config, full endpoint docs, and ops guidance
- [`CLAUDE.md`](CLAUDE.md) -- AI assistant quick-reference for codebase navigation
