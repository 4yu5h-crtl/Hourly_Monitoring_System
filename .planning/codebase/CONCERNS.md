# Codebase Concerns

**Analysis Date:** 2025-03-05

## Tech Debt

**Duplicate Save Operations:**
- Issue: Frontend calls multiple separate endpoints to save a single logical entry (e.g., `updateEntry` and `updateLossDetails`). If one fails, the data becomes inconsistent.
- Files: `src/lib/storage.ts`, `server/src/routes/entries.ts`
- Impact: Potential data corruption or partial saves where cumulative quantity is updated but loss reasons are lost.
- Fix approach: Combine these into a single transactional endpoint or use a database transaction on the backend.

**Hardcoded Configurations:**
- Issue: Shift time slots and OPC UA node IDs are hardcoded in the source code.
- Files: `server/src/controllers/opcController.ts`, `src/types/hms.ts`
- Impact: Changing shift timings or hardware addresses requires a code change and redeployment.
- Fix approach: Move these to a `system_config` table in the database or use environment variables for hardware-specific details.

**Manual Type Mapping:**
- Issue: Extensive manual mapping between API responses and frontend types.
- Files: `src/lib/storage.ts` (specifically `convertApiLogToShiftLog`)
- Impact: High maintenance overhead; adding a single column requires updates in SQL, backend controller, frontend API call, and the mapping function.
- Fix approach: Use a shared types library or an ORM/query builder that can generate types, and adopt a consistent naming convention (camelCase vs snake_case) across the stack.

**Lack of Database Transactions:**
- Issue: Backend controllers perform multiple database operations (checks, inserts, updates) without using SQL transactions.
- Files: `server/src/controllers/entriesController.ts`, `server/src/controllers/opcController.ts`
- Impact: Incomplete data in case of crashes or network errors during multi-step operations.
- Fix approach: Wrap related database operations in `START TRANSACTION` and `COMMIT` blocks.

## Security Considerations

**Authentication & Authorization:**
- Risk: No visible authentication mechanism for the API. Anyone with network access can view or modify production data.
- Files: `server/src/server.ts`, `server/src/routes/*.ts`
- Current mitigation: None detected.
- Recommendations: Implement JWT or session-based authentication. Restrict access to specific roles (e.g., Operator vs Manager).

**Permissive CORS:**
- Risk: Global `cors()` without restricted origins allows any website to make requests to the API if the user's browser allows it.
- Files: `server/src/server.ts`
- Current mitigation: Basic `cors()` middleware.
- Recommendations: Configure CORS to only allow the specific frontend origin(s) in production.

**Data Validation:**
- Risk: Minimal server-side validation of input data beyond basic existence checks.
- Files: `server/src/controllers/entriesController.ts`, `server/src/utils/validation.ts`
- Current mitigation: Some basic validation logic in `utils/validation.ts`, but inconsistently applied.
- Recommendations: Use a schema validation library like `Zod` or `Joi` on the backend to validate all request bodies.

## Performance Bottlenecks

**OPC UA Client Lifecycle:**
- Problem: An `OPCUAClient` is created, connected, and disconnected for every single request to read PLC data.
- Files: `server/src/controllers/opcController.ts`
- Cause: Lack of a persistent connection or connection pool for OPC UA.
- Improvement path: Implement a singleton or a long-running service that maintains a single connection to the PLC and periodically polls or subscribes to values.

**Database Indexing Gaps:**
- Problem: As the `hourly_entries` and `loss_details` tables grow, queries for history and reports might slow down.
- Files: `server/src/db/schema.sql`
- Cause: While basic indexes exist, complex joins or filtering by multiple fields (e.g., date range + machine) may lack optimized indexes.
- Improvement path: Review query patterns and add composite indexes where necessary.

## Fragile Areas

**Shift/Time Slot Logic:**
- Files: `server/src/controllers/opcController.ts` (specifically `getShiftAndTimeSlotFromKepwareTimestamp`)
- Why fragile: Complex calculations based on hardcoded minute offsets. It's difficult to test and easy to break if shift boundaries are not handled precisely.
- Safe modification: Encapsulate this logic in a dedicated utility with extensive unit tests for edge cases (e.g., midnight crossings, shift overlaps).

**Frontend-Backend Synchronization:**
- Files: `src/pages/DataEntry.tsx`, `src/lib/storage.ts`
- Why fragile: Relying on `onBlur` for saving without debouncing. If a user rapidly moves between fields, it can trigger many concurrent API calls.
- Safe modification: Implement debouncing for saves or a global "Save" button to give the user control and reduce server load.

**Port Mismatch:**
- Files: `server/src/server.ts`, `src/lib/api.ts`
- Why fragile: The backend defaults to port 5001, but the frontend API client defaults to port 5000.
- Safe modification: Align default ports or strictly enforce the use of environment variables for configuration.

## Scaling Limits

**Database Choice:**
- Current capacity: Single MySQL instance.
- Limit: Will handle current needs, but as data accumulates over years, performance of summary queries might degrade.
- Scaling path: Implement data archiving for old shift logs or optimize with materialized views for reports.

## Missing Critical Features

**Audit Logs:**
- Problem: No tracking of who changed what and when (beyond `updated_at`).
- Blocks: Accountability in case of data entry errors or malicious changes.

**Real-time Updates:**
- Problem: If multiple users are editing the same shift, they won't see each other's changes without a refresh.
- Blocks: Collaborative editing and real-time monitoring.

---

*Concerns audit: 2025-03-05*
