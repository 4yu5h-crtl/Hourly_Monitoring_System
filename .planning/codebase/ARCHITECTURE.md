# Architecture

**Analysis Date:** 2024-05-23

## Pattern Overview

**Overall:** Client-Server Single Page Application (SPA).

**Key Characteristics:**
- **Decoupled Frontend/Backend:** The frontend (React/Vite) and backend (Node.js/Express) are distinct applications communicating via a RESTful JSON API.
- **Service-Oriented Frontend:** Frontend components do not call the API directly; they use a service layer (`src/lib/storage.ts`) that handles data transformation, caching, and business logic.
- **Relational Data Model:** Uses a relational database (SQLite) for structured storage of shift logs, hourly entries, and production summaries.

## Layers

**Frontend (Client):**
- Purpose: Provides the user interface for data entry and history viewing.
- Location: `src/`
- Contains: React components, pages, hooks, and local state management.
- Depends on: Backend API, TanStack Query, Radix UI.
- Used by: End users (operators, engineers).

**Service Layer (Frontend):**
- Purpose: Orchestrates data flow between UI, API, and local storage.
- Location: `src/lib/storage.ts` and `src/lib/api.ts`
- Contains: API client methods, data transformation logic, and browser storage interactions.
- Depends on: Backend API via `fetch`.
- Used by: React components and pages.

**API Layer (Backend):**
- Purpose: Exposes endpoints for data persistence and retrieval.
- Location: `server/src/routes/`
- Contains: Express router definitions.
- Depends on: Controllers.
- Used by: Frontend service layer.

**Controller Layer (Backend):**
- Purpose: Processes incoming requests, interacts with the database, and returns JSON responses.
- Location: `server/src/controllers/`
- Contains: Request handlers and business logic.
- Depends on: Database connection.
- Used by: API routes.

**Database Layer (Backend):**
- Purpose: Persists application data.
- Location: `server/src/db/`
- Contains: SQLite connection setup, schema definitions, and migrations.
- Depends on: `sqlite3` driver.
- Used by: Controllers.

## Data Flow

**Data Entry Flow:**

1. User enters production data into `DataEntry.tsx`.
2. Component calls `saveEntry` or `saveSummary` in `src/lib/storage.ts`.
3. `storage.ts` performs local calculations (e.g., `recalculate` for hourly quantities) and updates `sessionStorage`.
4. `storage.ts` calls corresponding methods in `src/lib/api.ts`.
5. `api.ts` sends a PUT/POST request to the Express server.
6. Express router (`server/src/routes/entries.ts`) directs the request to the controller.
7. Controller (`server/src/controllers/entriesController.ts`) executes SQL queries via `server/src/db/connection.ts` to update SQLite.
8. Success response travels back to the frontend, which may trigger a TanStack Query cache invalidation to refresh the UI.

**State Management:**
- **Server State:** Managed by `@tanstack/react-query` in the frontend for efficient fetching, caching, and synchronization with the backend.
- **Local Cache:** `localStorage` and `sessionStorage` are used in `src/lib/storage.ts` to persist session metadata and current shift data across tab switches or refreshes.
- **UI State:** Managed by standard React `useState` and `useReducer` hooks within components.

## Key Abstractions

**ShiftLog:**
- Purpose: Represents a full production shift, including metadata (date, machine, channel), hourly entries, and a summary.
- Examples: `src/types/hms.ts` (TypeScript interface), `server/src/db/schema.sql` (Database tables).
- Pattern: Domain Model.

**Storage Service:**
- Purpose: Provides a high-level API for the frontend to interact with data, abstracting away the details of network requests and local caching.
- Examples: `src/lib/storage.ts`.
- Pattern: Service Pattern / Repository Pattern.

## Entry Points

**Frontend Entry Point:**
- Location: `src/main.tsx`
- Triggers: Browser page load.
- Responsibilities: Initializes React, sets up the `QueryClientProvider`, and renders the `App` component.

**Backend Entry Point:**
- Location: `server/src/server.ts`
- Triggers: Node.js process start.
- Responsibilities: Configures Express middleware, registers API routes, connects to the database, and starts the HTTP server.

## Error Handling

**Strategy:** Multi-layered error handling with user feedback via toasts.

**Patterns:**
- **Backend:** Try-catch blocks in controllers returning standardized JSON error responses (e.g., `{ error: "message" }`).
- **Frontend:** Service layer methods throw errors which are caught by components or TanStack Query.
- **UI:** User-facing errors are displayed using `sonner` (toasts) or `use-toast` hook.

## Cross-Cutting Concerns

**Logging:** Backend uses basic `console.log` middleware for request logging in `server/src/server.ts`.
**Validation:** Basic validation is performed in the frontend (HTML5 types and manual checks) and backend (e.g., `server/src/utils/validation.ts`).
**Authentication:** Not currently implemented (system appears to be for internal/local use).

---

*Architecture analysis: 2024-05-23*
