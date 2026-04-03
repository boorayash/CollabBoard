# Codebase Concerns

**Analysis Date:** 2026-03-31

## Tech Debt

**Real-Time Synchronization Strategy:**
- Issue: Choosing a Server-Authoritative model with Socket.io instead of Conflict-free Replicated Data Types (CRDTs) to simplify MVP development.
- Files: `D:\CollabBoard\.planning\research\ARCHITECTURE.md`, `D:\CollabBoard\.planning\research\PITFALLS.md`
- Impact: This approach makes offline-first support and granular collaborative text editing (like Google Docs) significantly harder to implement in the future. It also increases server load as the server must validate every mutation.
- Fix approach: If offline support or deep collaboration becomes critical, migrate state synchronization to a CRDT-based library like Yjs or Automerge.

**Monolithic Backend:**
- Issue: Planned as a monolithic Express/Node.js backend.
- Files: `D:\CollabBoard\.planning\PROJECT.md`
- Impact: Scaling specific real-time components independently of the REST API will be difficult.
- Fix approach: Decouple the Socket.io server from the REST API if traffic patterns diverge significantly.

## Known Bugs

**Pre-Implementation Status:**
- Symptoms: No code has been written yet.
- Files: `N/A`
- Trigger: `N/A`
- Workaround: `N/A`

## Security Considerations

**Socket.io Authorization Persistence:**
- Risk: JWT authorization is typically only checked during the initial WebSocket handshake. If a user's permissions change or they are removed from a team during an active session, they may retain unauthorized access.
- Files: `D:\CollabBoard\.planning\research\PITFALLS.md`
- Current mitigation: Planned re-validation middleware for Socket.io.
- Recommendations: Implement a mandatory permission check in a Socket.io middleware that runs for every incoming event, not just the connection handshake.

**Role-Based Access Control (RBAC) Simplicity:**
- Risk: The system only supports "Admin" and "Member" roles, which may lead to over-privileged users for complex teams.
- Files: `D:\CollabBoard\.planning\PROJECT.md`
- Current mitigation: Private boards by default.
- Recommendations: Plan for more granular permissions (Viewer, Editor, Manager) if the project scales beyond small teams.

## Performance Bottlenecks

**Socket.io "Fan-out" Events:**
- Problem: Broadcasting every update to all connected users regardless of their active board context.
- Files: `D:\CollabBoard\.planning\research\PITFALLS.md`
- Cause: Lack of granular room partitioning.
- Improvement path: Strictly use Socket.io Rooms (e.g., `board:${id}`) to ensure users only receive updates relevant to their current view.

**Reconnection State Drift:**
- Problem: Users may miss events during short network blips, leading to out-of-sync local states.
- Files: `D:\CollabBoard\.planning\research\PITFALLS.md`
- Cause: Reliance on fire-and-forget events without a synchronization sequence.
- Improvement path: Implement a reconciliation loop or sequence numbers for events, triggering a full state re-fetch on the `reconnect` event.

## Fragile Areas

**Card Reordering & Movement:**
- Files: `D:\CollabBoard\.planning\research\PITFALLS.md`, `D:\CollabBoard\.planning\research\ARCHITECTURE.md`
- Why fragile: Race conditions when multiple users move the same card or reorder the same list simultaneously.
- Safe modification: Use **Fractional Indexing** (lexicographical ranking) to avoid mass updates of integer indices. Ensure server-side validation of the target position's validity.
- Test coverage: Gaps: Requires intensive integration testing with multiple concurrent socket clients.

**Input Focus and Real-Time Sync:**
- Files: `D:\CollabBoard\.planning\research\PITFALLS.md`
- Why fragile: Real-time updates to a card's description while a user is typing can cause focus loss or cursor snapping in React.
- Safe modification: Decouple local input state from the real-time sync state. Only update the input from the server when the field is not focused.

## Scaling Limits

**WebSocket Connection Capacity:**
- Current capacity: ~10,000 concurrent connections on a single Node.js instance.
- Limit: Memory and CPU constraints of a single process.
- Scaling path: Implement the **Socket.io Redis Adapter** to share events across multiple server instances.

**Database Connection Pooling:**
- Current capacity: Default Prisma/PostgreSQL connection limits.
- Limit: High frequency of real-time mutations can exhaust the connection pool.
- Scaling path: Use **PgBouncer** or a similar connection pooler to manage database load.

## Dependencies at Risk

**Socket.io-client / React Integration:**
- Risk: Large real-time state updates can cause performance degradation in React if not handled carefully (e.g., triggering too many re-renders).
- Impact: Laggy UI, especially on lower-end devices.
- Migration plan: Use specialized state management selectors (Redux Toolkit) to minimize re-renders.

## Missing Critical Features

**Collaborative Text Editing:**
- Problem: Real-time "Google Docs" style editing within task descriptions is explicitly out of scope.
- Blocks: Prevents seamless collaboration on long-form content.
- Priority: Low for MVP, High for Power-User satisfaction.

**Presence Awareness (Detailed):**
- Problem: Only basic presence (who is on the board) is planned.
- Blocks: Users may still collide if they don't know exactly which field someone else is editing.

## Test Coverage Gaps

**Real-Time Synchronization Testing:**
- What's not tested: Concurrent mutations, race conditions, and network latency effects on conflict resolution.
- Files: `N/A (Implementation Pending)`
- Risk: High probability of edge-case bugs causing data desync between clients.
- Priority: High

---

*Concerns audit: 2026-03-31*
