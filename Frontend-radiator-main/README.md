# Radiator Stock Management Frontend

Single-page administrative dashboard for tracking radiator inventory, warehouse stock levels, sales, invoices, and customers. This repository contains only the React 19 + Vite frontend that communicates with the stock management REST API.

## Highlights

- Role-aware dashboard with navigation for Overview, Sales, Invoices, Customers, Inventory, Stock, Warehouses, and (for admins) User Management.
- Real-time sales, revenue, customer, and product insights with trend comparisons and activity feeds.
- Full CRUD tools for radiators, customers, warehouses, stock movements, and users, including bulk filters, sorting, and list/card views.
- Point of Sale workflow with quick invoice generation, receipt modal, and line-item cart interactions.
- Session-aware authentication with auto token refresh, inactivity warnings, and manual session extension to keep operators online.
- Built-in system health card for quickly checking API/database availability and environment configuration.

## Tech Stack

- React 19, React Router 7, Context API, and custom hooks for stateful flows.
- Vite 7 build tooling with @tailwindcss/vite and Tailwind CSS 4 for styling.
- Axios-based API layer with JWT authentication, refresh-token handling, and typed service helpers.
- Lucide and Heroicons iconography, clsx utility helpers, and custom UI primitives.

## Getting Started

### 1. Prerequisites

- Node.js 18+ and npm 9+ (React 19 + Vite require modern runtimes).
- Backend API running locally or remotely (default base URL is `http://localhost:5128/api/v1`).

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create `.env` (or `.env.local`) in the project root:

```bash
# REST API base URL
VITE_API_BASE=http://localhost:5128/api/v1

# Optional: enable verbose API logging in the browser console
VITE_DEBUG=false
```

Restart `npm run dev` any time you change environment variables.

### 4. Run the app

```bash
npm run dev
```

The development server defaults to `http://localhost:5173`. Log in with a user provisioned by the backend API.

## Available Scripts

- `npm run dev` – start Vite in development mode with hot reloading.
- `npm run build` – create a production build in `dist/`.
- `npm run preview` – serve the production build locally for smoke testing.
- `npm run lint` – run ESLint across the project (uses the Vite/React 19 config).

## Project Structure

```
src/
├─ api/              # Axios clients and service helpers (auth, sales, stock, etc.)
├─ components/       # Feature modules (dashboard, inventory, sales, warehouse, users)
├─ contexts/         # Auth provider with token/session management
├─ hooks/            # Data fetching, filtering, pagination, and modal hooks
├─ pages/            # Top-level route screens (PointOfSale, etc.)
├─ utils/            # Formatting helpers, toast notifications, constants
├─ App.jsx           # Router with protected routes, session warning banner
└─ main.jsx          # React entry that mounts the app
```

Notable UI modules include the Dashboard overview tiles, Inventory grid/list views, Sales management tables, Quick Invoice/Receipt modals, Warehouse stock transfers, and HealthCheck widget.

## API Integration

The frontend expects a running API that exposes endpoints for authentication, customers, radiators, stock movements, invoices, etc. Set `VITE_API_BASE` to the base URL of that service. Authentication uses access + refresh tokens stored in `sessionStorage`, and the UI will:

- Attach the bearer token on every request via Axios interceptors.
- Refresh tokens a few minutes before expiration.
- Warn operators when the session is about to expire and let them extend it.
- Log out gracefully when the server invalidates credentials.

## Production Build & Deployment

```bash
npm run build
```

Deploy the generated `dist/` folder to any static hosting provider (Netlify, Vercel, S3 + CDN, etc.) and configure `VITE_API_BASE` to point at the production API. Ensure the API supports CORS for the deployed origin.

## Troubleshooting

- Use the System Health widget on the login screen to verify API connectivity and database status.
- Check browser dev tools → Network tab for 401 responses; expired sessions can be extended from the warning banner or by logging in again.
- Set `VITE_DEBUG=true` to echo all API requests/responses in the console while debugging.
