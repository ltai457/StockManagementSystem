# Radiator Stock Management Frontend

React dashboard for Chan Mary 333, with inventory, warehouse stock, sales recording, stock activity, and administrator user management.

## Tech Stack

- React 19, TypeScript, Vite 7, and React Router 7.
- Material UI 7 with a shared theme and UI components.
- Axios services with JWT authentication and session management.

## Local Setup

Use Node.js 20.19+ or 22.12+ and run the backend at `http://localhost:5128`.

```bash
npm install
cp .env.example .env
npm run dev
```

The frontend runs at `http://localhost:5173`. Its environment defaults are:

```env
VITE_API_BASE=http://localhost:5128/api/v1
VITE_DEBUG=false
```

Restart Vite after changing environment variables. Development accounts are documented in the repository's root README.

## Scripts

- `npm run dev` — start the development server.
- `npm run lint` — run ESLint.
- `npm run typecheck` — check TypeScript types.
- `npm run build` — build the application into `dist/`.
- `npm run preview` — preview the built application locally.

## Structure

```text
src/
├── api/          Shared Axios client and feature services
├── components/   Dashboard, inventory, stock, warehouses, users, and shared UI
├── contexts/     Authentication and session state
├── hooks/        Data loading, filtering, scrolling, and modal state
├── theme/        Shared Material UI design system
├── types/        Domain and API types
├── utils/        Roles, images, stock, and formatting helpers
├── App.tsx       Application routes and session notifications
└── main.tsx      Entry point and theme provider
```

## API Integration

All services use `src/api/httpClient.ts` and the base URL from `src/config/api.ts`. Tokens are stored in `sessionStorage`; the authentication provider handles refreshes and session warnings.

Products are added and edited through the inventory forms. Individual images upload through `/api/v1/radiators/upload-image`; relative image paths resolve against the configured API origin.

## Troubleshooting

- **API requests fail:** confirm the backend is running and `VITE_API_BASE` is correct.
- **401 responses:** sign in again or extend the session when prompted.
- **Images missing:** check the backend uploads directory and the image request URL in browser developer tools.
- Enable `VITE_DEBUG=true` for additional API logs while debugging.
