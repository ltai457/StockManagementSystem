# Stock Management Platform

Full-stack inventory, sales, and warehouse management system for radiator products. The project combines a React 19 Vite frontend with a .NET 8 Web API backend to deliver dashboards, authentication, stock tracking, invoicing, and reporting.

```
StockManagementSystem/
├─ Frontend-radiator-main/    # React single-page application (SPA)
└─ MyBusinessBackend-main/    # ASP.NET Core REST API
```

## Platform Highlights

- **Role-aware dashboards** – Operators see sales, invoices, customers, inventory, stock levels, and warehouse activity; admins gain user management panels.
- **Real-time KPIs** – Dashboard overview cards, trend charts, and activity feeds driven by live API data.
- **Sales & invoicing workflows** – Quick invoice creation, POS cart management, receipt generation, and payment tracking.
- **Inventory control** – CRUD for radiators, S3-backed image uploads, warehouse stock movements, and audit history.
- **Authentication & session management** – JWT access/refresh tokens, session warnings, auto renewals, and secure logout.
- **Operational tooling** – Health checks, ping endpoints, structured logging, and Swagger documentation for API exploration.

## Tech Stack

| Layer     | Technologies                                                                                   |
|-----------|------------------------------------------------------------------------------------------------|
| Frontend  | React 19, Vite 7, Tailwind CSS 4, React Router 7, Axios, Lucide/Heroicons, custom hooks        |
| Backend   | ASP.NET Core 8, Entity Framework Core 9, PostgreSQL, JWT Bearer Auth, AWS S3, DotNetEnv, Swagger |
| Build/Tooling | npm, ESLint, .NET CLI, EF Core migrations |

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url> StockManagementSystem
cd StockManagementSystem
```

### 2. Backend setup (`MyBusinessBackend-main`)

1. Install prerequisites: .NET 8 SDK, PostgreSQL, (optional) AWS credentials for S3.
2. Copy `MyBusinessBackend-main/appsettings.json` sensitive values into a `.env` file or environment variables:

   ```bash
   # MyBusinessBackend-main/.env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=radiatorstockdb
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   JWT__Secret=ReplaceWith32CharSecret
   JWT__Issuer=RadiatorStockAPI
   JWT__Audience=RadiatorStockAPI-Users
   ALLOWED_ORIGINS=http://localhost:5173
   ```

3. Apply EF Core migrations and seed base data:

   ```bash
   cd MyBusinessBackend-main
   dotnet restore
   dotnet ef database update   # generates schema & seeds admin/staff users
   dotnet run                  # API on http://localhost:5128
   ```

   Swagger UI: `http://localhost:5128/swagger` (Development environment only). Health endpoint: `/health`.

### 3. Frontend setup (`Frontend-radiator-main`)

1. Install prerequisites: Node.js 18+ and npm 9+ (or pnpm/yarn).
2. Configure environment variables:

   ```bash
   cd ../Frontend-radiator-main
   cp .env.example .env    # if available, otherwise create manually
   ```

   ```bash
   # Frontend-radiator-main/.env
   VITE_API_BASE=http://localhost:5128/api/v1
   VITE_DEBUG=false
   ```

3. Install and run:

   ```bash
   npm install
   npm run dev    # http://localhost:5173
   ```

   Log in with seeded credentials (admin/admin staff1 etc.) or accounts created through the API.

## Development Workflow

1. Start the backend (`dotnet run`) to expose the API and database.
2. Start the frontend (`npm run dev`) for hot-reloaded UI development.
3. Use Swagger or `RadiatorStockAPI.http` to test endpoints during development.
4. The frontend session management warns before JWT expiry; you can extend the session from the UI.

## Deployment Notes

- **Backend**: Publish the .NET API to your hosting environment (Azure App Service, AWS ECS/Beanstalk, Docker, etc.). Supply connection strings, JWT secrets, CORS origins, and AWS credentials via environment variables or secret stores.
- **Frontend**: `npm run build` generates a static bundle (`dist/`) deployable to Netlify, Vercel, S3 + CloudFront, etc. Set `VITE_API_BASE` to the deployed API URL before building.
- **Database**: Use managed PostgreSQL (RDS, Azure Database for PostgreSQL) with SSL; ensure migrations run as part of deployment.
- **Images**: Configure S3 bucket permissions for radiator image storage (`my-radiator-images` in `AWS:S3:BucketName`).

## Repository Docs

- `Frontend-radiator-main/README.md` – detailed frontend instructions, scripts, and troubleshooting.
- `MyBusinessBackend-main/README.md` – backend configuration, endpoints, and ops guidance.

Refer to those files for layer-specific details. This root overview is meant to orient you to the full-stack project layout and combined setup flow.
