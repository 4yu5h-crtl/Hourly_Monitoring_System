# External Integrations

**Analysis Date:** 2024-05-22

## APIs & External Services

**OPC UA (Industrial Communication):**
- Kepware/PLC - Used for fetching real-time cumulative quantity (`cum_qty`) from industrial machines.
  - SDK/Client: `node-opcua`
  - Config: `OPC_CH02_ENDPOINT_URL`, `OPC_CH02_NODE_ID`
  - Implementation: `server/src/controllers/opcController.ts`

## Data Storage

**Databases:**
- MySQL
  - Connection: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
  - Client: `mysql2/promise` (Native driver with promises)
  - Connection Pool: `server/src/db/connection.ts`

**File Storage:**
- Local filesystem only - Used for storing initial database schema and migrations.
  - `server/src/db/schema.sql`
  - `server/src/db/migration_add_loss_columns.sql`

**Caching:**
- None detected (Frontend uses React Query for in-memory data caching).

## Authentication & Identity

**Auth Provider:**
- None detected. The application appears to be an internal-only tool with direct database and OPC access.

## Monitoring & Observability

**Error Tracking:**
- Basic Express error handling middleware in `server/src/server.ts`.

**Logs:**
- Console-based logging via middleware in `server/src/server.ts` using `console.log`.

## CI/CD & Deployment

**Hosting:**
- On-premises or cloud server capable of running Node.js and MySQL.
- Managed by PM2 as seen in `ecosystem.config.cjs`.

**CI Pipeline:**
- None detected in repository.

## Environment Configuration

**Required env vars (Frontend):**
- `VITE_API_URL`: URL of the backend API.

**Required env vars (Backend):**
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`: Database connection details.
- `OPC_CH02_ENDPOINT_URL`, `OPC_CH02_NODE_ID`: OPC UA connection details.
- `PORT`: Server port (default: 5001).

**Secrets location:**
- Stored in `.env` files in the root and `server/` directories (excluded from Git).

## Webhooks & Callbacks

**Incoming:**
- None detected.

**Outgoing:**
- None detected.

---

*Integration audit: 2024-05-22*
