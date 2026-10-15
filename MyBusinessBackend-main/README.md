# Radiator Stock Management API

ASP.NET Core 8 REST API for the Chan Mary 333 inventory system. It manages authentication, products, brands, product types, warehouses, stock operations, audit history, users, and local product images.

## Tech Stack

- .NET 8, Entity Framework Core 9, and PostgreSQL with snake_case naming.
- JWT access tokens and rotating refresh tokens, with BCrypt password hashing.
- DotNetEnv for local environment configuration.
- Swagger UI for exploring the API in Development.

## Local Setup

Install the .NET 8 SDK and PostgreSQL 15+, then run commands from this directory.

1. Restore packages:

   ```bash
   dotnet restore
   ```

2. Copy `.env.example` to `.env` and configure the database and JWT values. The JWT secret must contain at least 32 bytes. An explicit `ConnectionStrings__DefaultConnection` overrides the `DB_*` variables; Development also has a connection string in `appsettings.Development.json`, which should match your local PostgreSQL account.

3. Apply the existing migrations:

   ```bash
   dotnet ef database update
   ```

   Development also applies pending migrations on startup. Default user seeding is enabled in `appsettings.Development.json` and creates these accounts when the users table is empty:

   | Role | Username | Password |
   |------|----------|----------|
   | Admin | admin | Admin123! |
   | Staff | staff1 | Staff123! |

4. Run the API:

   ```bash
   dotnet run
   ```

   API: `http://localhost:5128/api/v1`. Swagger: `http://localhost:5128/swagger`.

## Key Endpoints

- `/api/v1/auth` — login, administrator-only registration, token refresh, logout, password changes, and current user.
- `/api/v1/radiators` — product list, details, creation, updates, and deletion.
- `POST /api/v1/radiators/upload-image` — individual product image upload for Admin/Staff.
- `/api/v1/brands` and `/api/v1/product-types` — catalogue reference data.
- `/api/v1/warehouses` — warehouse management.
- `/api/v1/stock` — stock summaries, movements, history, stock in, sales, adjustments, transfers, and bulk stock updates.
- `/api/v1/users` — administrator-only user management.
- `/health`, `/health/live`, `/ping`, and `/api/v1/info` — connectivity and API information.

Inspect `Controllers/` and Swagger for request/response contracts.

## Images

Images are stored in `wwwroot/uploads/radiators/` and served under `/uploads/radiators/`. `UPLOADS_ROOT_PATH` and `UPLOADS_REQUEST_PATH` can override these defaults. Uploads support JPG, PNG, GIF, and WebP, with matching file signatures and an 8 MB limit per image.

The frontend resolves relative image paths against its API origin. Keep the uploads directory when cleaning build output.

## Verification

From the repository root:

```bash
dotnet test StockManagementSystem.sln --configuration Release
```

## Troubleshooting

- **Database connection fails:** check the active connection string, `DB_*` settings, and PostgreSQL service.
- **JWT configuration error:** use a secret with at least 32 bytes and configure issuer/audience values.
- **401 responses:** sign in again to obtain fresh tokens.
- **CORS errors:** local startup should use the Development launch profile. Other environments read `ALLOWED_ORIGINS`.
- **Images missing:** check the configured uploads directory and the frontend's `VITE_API_BASE` value.
