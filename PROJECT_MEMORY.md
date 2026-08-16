# Stock Management System — Project Memory

This is the canonical quick-start context for future development sessions. Read this file before exploring the codebase, then inspect only the files relevant to the current task.

Last verified: **2026-08-16**  
Current working branch: **`update-to-use-share`**

## Current state

- Full-stack radiator inventory system for Chan Mary 333.
- Frontend: React 19, TypeScript, Vite 7, React Router 7, Material UI 7, Axios.
- Backend: ASP.NET Core 8, EF Core, PostgreSQL, JWT authentication.
- The frontend UI was migrated completely from Tailwind/custom classes to the shared MUI design system.
- Tailwind, `@tailwindcss/vite`, `src/App.css`, and all frontend `className` styling were removed.
- The migration is currently local and must be committed/pushed separately when requested.

Last verification commands all passed:

```bash
cd Frontend-radiator-main
npm run lint
npm run typecheck
npm run build
git diff --check
```

The production build currently reports only a non-blocking warning that the main JavaScript chunk is larger than 500 kB.

## Repository map

```text
StockManagementSystem/
├── Frontend-radiator-main/       React/Vite application
├── MyBusinessBackend-main/       ASP.NET Core API
├── deploy/                       Deployment documentation
├── StockManagementSystem.sln     .NET solution
└── PROJECT_MEMORY.md             This file
```

## Frontend architecture

The normal data flow is:

```text
Feature component → custom hook → API service → shared httpClient → backend
```

Important locations:

```text
Frontend-radiator-main/src/
├── api/                 Shared Axios client, request helpers, feature services
├── components/
│   ├── auth/            Login and protected-route UI
│   ├── dashboard/       Application shell and overview
│   ├── inventory/       Product catalogue and stock adjustment
│   ├── stock/           Stock operations, sales, transfers, activity
│   ├── users/           Admin user management
│   ├── warehouse/       Warehouse management
│   └── common/          Shared UI, layouts, feedback, and modals
├── contexts/            Authentication/session state
├── hooks/               Reusable feature state and data loading
├── theme/               Global MUI design system
├── types/               Shared TypeScript domain/API types
├── utils/               Stock, role, image, and formatting helpers
├── App.tsx              Routes and session-expiry notification
└── main.tsx             MUI provider and React entry point
```

## UI rules

Material UI is the only frontend styling system. Do not reintroduce Tailwind or page-specific CSS.

Use shared components from:

```tsx
import {
  AppCard,
  AppTable,
  AppTextField,
  Button,
  Modal,
  SearchInput,
} from "../components/common/ui";
```

Shared visual files:

- `src/theme/colors.ts` — application palette.
- `src/theme/typography.ts` — typography definitions.
- `src/theme/componentOverrides.ts` — global MUI component appearance.
- `src/theme/index.ts` — assembled responsive theme.
- `src/theme/AppThemeProvider.tsx` — theme and CSS baseline provider.
- `src/components/common/ui/` — reusable fields, buttons, cards, tables, and modals.
- `src/components/common/layout/` — page headers, stats, and empty states.
- `src/components/common/feedback/` — loading, error, and access-denied states.

Preferred styling order:

1. Reuse a shared component.
2. Improve a global theme override when the change should apply everywhere.
3. Use MUI layout props or `sx` for genuinely local layout needs.
4. Do not add `className`, Tailwind utilities, or new CSS files.

Before completing UI work, check:

```bash
rg -n 'className=|tailwind|@tailwindcss' src vite.config.ts package.json package-lock.json
```

The command should produce no output.

## API rules

- Use `src/api/httpClient.ts`; do not create separate Axios instances in feature components.
- The client obtains the base URL from `src/config/api.ts`.
- Authentication token injection and global 401 handling are registered centrally.
- Use `handleRequest` from `src/api/apiHelpers.ts` so services return a consistent `ApiResult<T>`.
- Use `createCrudService` for conventional CRUD resources.
- Put shared request/response types in `src/types/`.
- Components should call hooks or services; avoid direct Axios calls in UI files.
- Let the browser set multipart boundaries when sending `FormData`; the shared client removes the JSON content type automatically.

Frontend environment variables:

```env
VITE_API_BASE=http://localhost:5128/api/v1
VITE_NGROK_URL=https://example.ngrok-free.app  # optional fallback
VITE_DEBUG=false
```

## Product data

Product creation uses `CreateRadiatorPayload` from `src/types/radiator.ts`.

Required fields:

- `brand`
- `code`
- `model`

Optional fields:

- `type`
- `coreDimension`
- `dimension`
- `imageUrl`
- `notes`
- `initialStock` — object keyed by warehouse code with numeric quantities

For spreadsheet import, use the stable headers:

```text
brand, code, model, type, coreDimension, dimension, imageUrl, notes
```

Warehouse starting quantities need one agreed convention before implementing import, preferably columns such as `stock_AKL`, `stock_CHC`, etc., converted into `initialStock`.

## Important behavior

- User roles: Administrator = `1`, Staff = `2`.
- User-management access is administrator-only.
- Low-stock threshold is `10`, defined in `src/utils/stock.ts`.
- Stock changes must go through stock API operations so the backend records audit history.
- Supported operations include stock in, sale, transfer, and manual adjustment.
- Product images depend on persistent backend/S3 storage; ephemeral droplet storage is not a safe backup.
- Frontend images are resolved relative to the configured API origin when needed.

## Development commands

Frontend:

```bash
cd Frontend-radiator-main
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

Backend:

```bash
cd MyBusinessBackend-main
dotnet restore
dotnet ef database update
dotnet run
```

Local defaults:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5128`
- API base: `http://localhost:5128/api/v1`

## Known technical debt

- Several migrated `.tsx` feature files still contain `// @ts-nocheck` (63 occurrences at the last count). TypeScript compilation passes, but removing these gradually and adding explicit prop/domain types is the next typing-quality project.
- There is no comprehensive automated frontend test suite. Lint, typecheck, production build, and a browser/API smoke test are the current release checks.
- The main frontend bundle should eventually be split with route/feature-level lazy imports.
- Documentation must not claim Tailwind is installed; the frontend is MUI-only.

## Git safety

- Preserve unrelated user changes in the working tree.
- Do not commit, push, delete branches, or rewrite history unless explicitly requested.
- A GitHub-created remote branch must be fetched before local checkout:

```bash
git fetch origin
git switch --track origin/<branch-name>
```

## Keeping this memory accurate

Update this file whenever any of these change:

- framework or dependency choices;
- shared UI/API architecture;
- environment variables;
- important domain fields or role rules;
- verification commands;
- known technical debt;
- completion/commit status of a major migration.

Do not store production passwords, tokens, private keys, database credentials, or other secrets in this file.
