# Technology Stack

**Analysis Date:** 2024-05-22

## Languages

**Primary:**
- TypeScript 5.8.3 (Frontend) - `tsconfig.json`, `tsconfig.app.json`
- TypeScript 5.3.3 (Backend) - `server/tsconfig.json`

## Runtime

**Environment:**
- Node.js (Backend)
- Browser (Frontend)

**Package Manager:**
- npm (Node Package Manager)
- Lockfile: `package-lock.json` present at root and in `server/`

## Frameworks

**Core:**
- React 18.3.1 (Frontend) - UI components and state management
- Vite 8.0.3 (Frontend) - Build tool and development server
- Express 4.18.2 (Backend) - RESTful API server

**Testing:**
- Vitest 3.2.4 (Frontend) - Unit/Integration tests
- Playwright 1.57.0 (E2E) - Browser-based end-to-end testing

**Build/Dev:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework
- Radix UI - Primitive UI components (via Shadcn)
- Lucide React 0.462.0 - Icon library
- tsx 4.7.0 (Backend) - TypeScript execution for Node.js (development)

## Key Dependencies

**Critical:**
- `react-router-dom` 6.30.1 - Frontend routing
- `@tanstack/react-query` 5.83.0 - Server state management and data fetching
- `zod` 3.25.76 - Schema validation for frontend and API
- `react-hook-form` 7.61.1 - Form management and validation
- `node-opcua` 2.168.0 (Backend) - OPC UA client for industrial communication
- `mysql2` 3.6.5 (Backend) - MySQL client for database communication
- `uuid` 9.0.0 - Unique identifier generation

**Infrastructure:**
- `cors` 2.8.5 - Cross-Origin Resource Sharing for the API
- `dotenv` 16.3.1 - Environment variable management
- `recharts` 2.15.4 - Charting library for production data visualization

## Configuration

**Environment:**
- Managed via `.env` files (e.g., `.env` for root/frontend, `.env` for backend)
- Frontend uses `VITE_API_URL` for backend communication.
- Backend uses `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, and `OPC_` variables.

**Build:**
- `vite.config.ts` - Root Vite configuration
- `server/tsconfig.json` - Backend TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS theme and plugin configuration

## Platform Requirements

**Development:**
- Node.js (Current LTS recommended)
- MySQL Server (hms_system database)
- Kepware/OPC UA Server (for OPC features)

**Production:**
- PM2 or similar process manager (via `ecosystem.config.cjs`)
- Deployment target: Typically a Windows/Linux server on-premises or cloud.

---

*Stack analysis: 2024-05-22*
