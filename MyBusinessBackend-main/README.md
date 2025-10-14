# Radiator Stock Management API

ASP.NET Core 8 REST API that powers the Chan Mary 333 radiator stock platform. It centralises authentication, inventory, warehouse stock levels, customer data, sales, invoices, and image storage for the React dashboard.

## Features

- JWT authentication with refresh tokens, role-based (Admin/Staff) authorization, and password change endpoint.
- Entities for radiators, warehouses, stock levels/history, customers, sales, invoices, users, and stored images.
- AWS S3 integration for uploading radiator images (`/api/v1/radiators/create-with-image`, `/{id}/images`).
- PostgreSQL persistence via Entity Framework Core with automatic migrations and startup seeding.
- Health, ping, and API info endpoints for Ops tooling plus full Swagger documentation (with JWT support) in development.
- CORS policy that opens all origins in development and reads comma-delimited origins from `ALLOWED_ORIGINS` in production.

## Tech Stack

- .NET 8 Web API + Minimal hosting model (`Program.cs`)
- Entity Framework Core 9 with Npgsql provider
- BCrypt password hashing
- AWS SDK for S3 uploads
- DotNetEnv for `.env` support alongside `appsettings`
- Swashbuckle (Swagger UI) for API exploration

## Prerequisites

- [.NET SDK 8.0](https://dotnet.microsoft.com/download) or later
- PostgreSQL 15+ (local instance or managed service)
- (Optional) AWS account with an S3 bucket for radiator images

## Local Setup

1. **Clone & restore packages**

   ```bash
   dotnet restore
   ```

2. **Create environment configuration**

   The app reads from `appsettings*.json`, environment variables, and a `.env` file (thanks to DotNetEnv). Create a `.env` file in the project root:

   ```bash
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=radiatorstockdb
   DB_USERNAME=postgres
   DB_PASSWORD=postgres

   # JWT
   JWT__Secret=ReplaceWith32CharOrMoreSecret
   JWT__Issuer=RadiatorStockAPI
   JWT__Audience=RadiatorStockAPI-Users
   JWT__AccessTokenExpirationMinutes=30
   JWT__RefreshTokenExpirationDays=7

   # CORS (comma-separated list)
   ALLOWED_ORIGINS=http://localhost:5173

   # AWS (optional for image uploads)
   AWS__Region=us-east-2
   AWS__S3__BucketName=my-radiator-images
   AWS__AccessKeyId=YOUR_ACCESS_KEY
   AWS__SecretAccessKey=YOUR_SECRET_KEY
   ```

   Alternatively, override `ConnectionStrings:DefaultConnection` directly via an environment variable (`ConnectionStrings__DefaultConnection`) if you prefer a full connection string.

3. **Apply database migrations**

   The API runs `context.Database.Migrate()` on startup. If the `Migrations/` folder is missing on a fresh clone, generate it before updating the database:

   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

   Startup seeding will create default warehouses and the following users:

   - Admin — `admin` / `Admin123!`
   - Staff — `staff1` / `Staff123!`

4. **Run the API**

   ```bash
   dotnet run --project RadiatorStockAPI.csproj
   ```

   The development server listens on `http://localhost:5128`. Swagger UI is available at `http://localhost:5128/swagger` when `ASPNETCORE_ENVIRONMENT=Development`.

## Key Endpoints

- `POST /api/v1/auth/login` – Issue access + refresh tokens. Supports `/register`, `/refresh`, `/logout`, `/change-password`, and `/me`.
- `GET /api/v1/radiators` – CRUD for radiators, including image upload to S3. `Admin` can delete; `Admin` and `Staff` can create/update.
- `GET /api/v1/warehouses` – Manage warehouses; includes stock level aggregation.
- `GET /api/v1/stock/movements` – Track transfers, adjustments, and audit history.
- `GET /api/v1/customers` – Manage customer records.
- `GET /api/v1/sales` – Sales and invoices (creation, retrieval, quick-invoice helpers).
- `GET /api/v1/users` – User management endpoints (admin only).
- `GET /health` / `GET /ping` / `GET /api/v1/info` – Operational readiness endpoints (no auth required).

Inspect `Controllers/` and `Services/` for full request/response contracts. `RadiatorStockAPI.http` contains sample requests that you can run from JetBrains Rider, VS Code REST client, or similar tools.

## Deployment Notes

- Set production secrets through environment variables or a secure secret store (do **not** ship credentials in `appsettings.json`).
- Provide the PostgreSQL CA certificate or set `SSL Mode=Require` as needed for managed services.
- Configure `ALLOWED_ORIGINS` with your hosted frontend URL(s).
- Ensure the hosting environment exposes port `5128` (or override `ASPNETCORE_URLS`).
- For S3 uploads, grant the IAM user `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` on the chosen bucket.

## Troubleshooting

- **Cannot connect to database** – verify `DB_*` settings and that PostgreSQL accepts connections from your machine. Startup logs print the connection string (without the password) to aid debugging.
- **401 errors in client** – confirm the JWT secret/issuer/audience match between API and frontend, and that tokens are refreshed before expiry.
- **CORS failures** – double-check `ALLOWED_ORIGINS` in production or ensure you're running with `Development` environment locally (which allows any origin).
- **Image upload errors** – set AWS credentials in the environment or configure a shared credentials profile (`AWS:Profile`). Check that the bucket exists in the configured region.

---

Kick the tyres with Swagger, wire it to the frontend (`VITE_API_BASE=http://localhost:5128/api/v1`), and customise services/controllers as your domain evolves.
