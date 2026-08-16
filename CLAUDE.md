# CLAUDE.md -- Project Quick Reference

> **Canonical context:** Read [`PROJECT_MEMORY.md`](PROJECT_MEMORY.md) first. It reflects the current TypeScript, shared API, and MUI-only frontend. Any conflicting older detail in this file should be treated as stale.

## What is this project?

A full-stack **radiator stock management system** for **Chan Mary 333**. Tracks radiator inventory across multiple warehouses with role-based access, stock operations, and audit history.

## Repository Layout

```
StockManagementSystem/
├─ MyBusinessBackend-main/          # ASP.NET Core 8 Web API
│   ├─ Controllers/                 # 6 API controllers (Auth, Radiator, Warehouse, Stock, User, Info)
│   ├─ Services/                    # Business logic + DAL (~37 files, organized by feature)
│   ├─ Models/                      # EF Core entities (Radiator, Warehouse, StockLevel, StockHistory, User, RefreshToken)
│   ├─ DTOs/                        # Request/response DTOs (especially Stock/ has ~20 DTOs)
│   ├─ Data/
│   │   ├─ RadiatorDbContext.cs     # EF Core DbContext with all entity configs
│   │   └─ SeedData.cs             # Seeds admin/staff users, demo radiators, warehouses
│   ├─ Mappers/                     # DTO ↔ Entity mappers
│   ├─ Migrations/                  # EF Core migration history
│   ├─ Program.cs                   # DI container, middleware pipeline, health checks (~392 lines)
│   ├─ appsettings.json             # Config with env var placeholders
│   ├─ appsettings.Development.json # Local dev overrides
│   └─ .env                         # Local secrets (DB, JWT) -- DO NOT COMMIT real secrets
│
├─ Frontend-radiator-main/          # React 19 SPA
│   ├─ src/
│   │   ├─ api/                     # Axios HTTP layer
│   │   │   ├─ httpClient.ts        # Shared Axios instance with JWT interceptor
│   │   │   ├─ apiHelpers.ts        # Shared result/error and CRUD helpers
│   │   │   ├─ authService.ts       # Auth + session management
│   │   │   ├─ radiatorService.ts   # Radiator CRUD
│   │   │   ├─ warehouseService.ts  # Warehouse CRUD
│   │   │   ├─ stockService.ts      # Stock operations (transfer, adjust, sale, inbound)
│   │   │   └─ userService.ts       # User management
│   │   ├─ components/              # ~51 components organized by feature
│   │   │   ├─ auth/                # Login
│   │   │   ├─ dashboard/           # Overview, QuickActions, RecentActivity
│   │   │   ├─ common/              # Header, Sidebar, modals, loaders, ProtectedRoute
│   │   │   ├─ inventory/           # Radiator management views
│   │   │   ├─ stock/               # Stock level management
│   │   │   ├─ warehouse/           # Warehouse management
│   │   │   └─ users/               # User admin panel
│   │   ├─ contexts/
│   │   │   └─ AuthContext.tsx      # Auth provider (session state, token refresh, activity tracking)
│   │   ├─ hooks/                   # 8 custom hooks
│   │   │   ├─ useStockManagement.js  # Main stock logic (~249 lines)
│   │   │   ├─ useAuth.js
│   │   │   ├─ useUsers.js
│   │   │   ├─ useWarehouses.js
│   │   │   ├─ useFilters.js
│   │   │   ├─ useModal.js
│   │   │   └─ useInfiniteScroll.js
│   │   ├─ theme/                   # Shared MUI design system
│   │   ├─ types/                   # Shared TypeScript domain/API types
│   │   ├─ utils/                   # Formatting, toast, constants
│   │   │   └─ stock.js             # LOW_STOCK_THRESHOLD = 6
│   │   ├─ App.tsx                  # Router with protected routes
│   │   └─ main.tsx                 # Entry point and MUI theme provider
│   ├─ vite.config.ts               # Dev server (port 5173), proxy to backend, chunk splitting
│   ├─ package.json
│   └─ .env                         # VITE_API_BASE, VITE_DEBUG
│
├─ StockManagementSystem.sln        # VS solution file
└─ *.sql                            # DB helper scripts (snake_case conversions)
```

## Tech Stack

- **Backend**: .NET 8, EF Core 9, PostgreSQL 15+, JWT Bearer auth, BCrypt, DotNetEnv, Swagger
- **Frontend**: React 19, TypeScript, Vite 7, React Router 7, Axios, MUI 7, Lucide/Heroicons
- **DB naming**: snake_case (via EFCore.NamingConventions)

## Database Entities

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| Radiator | Brand, Code (unique), Name, Year, RetailPrice/TradePrice/CostPrice, Dimensions, Notes | Central product entity |
| Warehouse | Code (unique), Name, Address, Email, Phone, Location | Physical storage locations |
| StockLevel | RadiatorId + WarehouseId (composite unique), Quantity | Per-product-per-warehouse count |
| StockHistory | RadiatorId, WarehouseId, OldQuantity, NewQuantity, MovementType, ChangeType, UpdatedBy, Notes | Full audit trail |
| User | Username (unique), Email (unique), PasswordHash, Role (Admin=1, Staff=2), IsActive | BCrypt hashed passwords |
| RefreshToken | Token (unique), UserId, ExpiryDate, IsRevoked | JWT refresh token storage |

## Key Architecture Patterns

- **Backend flow**: Controller → Service → DAL → EF Core DbContext
- **Frontend flow**: Component → Custom Hook → API Service → Axios (httpClient.js) → Backend
- **Auth**: JWT access (15 min) + refresh (7 days). Frontend stores in sessionStorage. Auto-refresh 2 min before expiry. Session timeout warning at 10 min before expiry.
- **Authorization**: Public (health/ping/info), Authenticated (most CRUD), Admin+Staff (create/update), Admin-only (delete, user management)
- **State management**: React Context API (AuthContext). No Redux/Zustand.

## Development Commands

```bash
# Backend
cd MyBusinessBackend-main
dotnet restore
dotnet ef database update    # Apply migrations + seed data
dotnet run                   # Runs on http://localhost:5128

# Frontend
cd Frontend-radiator-main
npm install
npm run dev                  # Runs on http://localhost:5173
npm run build                # Production build → dist/
npm run lint                 # ESLint
```

## Default Seed Credentials

- Admin: `admin` / `Admin123!`
- Staff: `staff1` / `Staff123!`

## Environment Variables

### Backend (.env)
```
DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD
JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE
ALLOWED_ORIGINS (comma-separated)
AWS__Region, AWS__S3__BucketName, AWS__AccessKeyId, AWS__SecretAccessKey (optional, for image uploads)
```

### Frontend (.env)
```
VITE_API_BASE=http://localhost:5128/api/v1
VITE_DEBUG=true|false
```

## Common Tasks

### Add a new API endpoint
1. Create/update DTO in `MyBusinessBackend-main/DTOs/`
2. Add service interface + implementation in `Services/`
3. Add controller action in `Controllers/`
4. Register service in `Program.cs` DI container

### Add a new frontend page/feature
1. Create component(s) in `src/components/{feature}/`
2. Add API service methods in `src/api/{feature}Service.js`
3. Create custom hook if state logic is complex (`src/hooks/`)
4. Add route in `src/App.tsx`

### Database schema change
1. Modify entity model in `Models/`
2. Update `RadiatorDbContext.cs` if needed
3. Run `dotnet ef migrations add <MigrationName>`
4. Run `dotnet ef database update` (or let auto-migrate on startup)

### Stock operations
Stock operations go through `StockController` → `StockService` → creates `StockHistory` audit record automatically. Movement types: `INCOMING`, `OUTGOING`. Change types: `Manual Update`, `Sale`, `Stock In`, `Transfer`.

## Important Notes

- Development may run migrations automatically. Production expects migrations as a release step and fails startup when migrations are pending.
- The frontend Vite dev server proxies `/api` requests to the backend (configured in `vite.config.ts`)
- CORS is open in Development, restricted to `ALLOWED_ORIGINS` in Production
- Security headers are set in middleware (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Backend production-control regression tests live in `MyBusinessBackend.Tests` and run through `dotnet test StockManagementSystem.sln`.
- The `DigitalOcean` branch contains deployment-specific configuration for DigitalOcean App Platform
