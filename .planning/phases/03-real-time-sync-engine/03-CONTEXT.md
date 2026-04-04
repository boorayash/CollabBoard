# Phase 3: Real-Time Sync Engine - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning
**Source:** User-provided detailed specifications

<domain>
## Phase Boundary

Transform CollabBoard from a single-user REST-based application into a real-time multiplayer collaborative system using Socket.IO. By the end of this phase:
- Multiple users can open the same board
- Any action by one user is instantly reflected for others
- No refresh required
- No duplicate updates
- No inconsistent state
</domain>

<decisions>
## Implementation Decisions

### Architecture (LOCKED)
- **3-layer architecture**: Database Layer (PostgreSQL/Prisma), API Layer (Express), Real-time Layer (Socket.IO)
- **Socket.IO is NOT the data source — PostgreSQL is**
  - API → writes to DB (source of truth)
  - Socket → only broadcasts changes
  - If this rule is broken, the app will become inconsistent under load

### Scope (LOCKED)
- **In scope for Phase 3:**
  - Card create
  - Card move (drag-drop)
  - Card update (title)
  - Card delete
  - List create
  - List reorder
- **Explicitly NOT included:**
  - Comments (deferred)
  - Notifications (deferred)
  - Presence/online users (deferred — roadmap says 03-03 Presence Service, but user explicitly excluded it)

### Room Strategy (LOCKED)
- **Board-based rooms**: Each board = 1 socket room
- Users join a room when they open a board
- Users leave a room when they navigate away
- Only users on the same board receive updates
- Prevents unnecessary data flow between boards

### Event Design (LOCKED)
- **Naming convention**: `entity:action` (e.g., `card:create`, `card:move`, `list:create`)
- **Payload rules**:
  - Minimal — only enough data to update UI
  - Specific — no entire board data blasts
  - Example: Card Move event includes `cardId`, `sourceListId`, `destinationListId`, `newRank`

### Data Flow Lifecycle (LOCKED)
1. User performs action (e.g., drags a card)
2. Frontend calls backend API
3. Backend updates database
4. Backend emits socket event to the board room (AFTER DB update, never before)
5. Other clients receive event
6. Other clients update Redux state
7. UI re-renders automatically

### Duplicate Prevention Strategy (LOCKED — Option A)
- **The user who performed the action**: Uses API response only (ignores their own socket event)
- **Other users**: Use socket events to update their Redux state
- This is simpler than Operation ID deduplication and sufficient for MVP

### Redux Integration (LOCKED)
- Sockets NEVER directly manipulate UI
- Flow: Socket Event → Redux Action → State Update → UI
- Keeps state predictable, avoids bugs, keeps debugging easy

### Agent's Discretion
- Socket.IO authentication mechanism (JWT token in handshake vs middleware)
- Exact socket event handler file organization
- Whether to use socket.io namespaces or just rooms
- Error handling and reconnection strategy

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Server Architecture
- `server/src/app.js` — Express app setup, route registration, middleware chain
- `server/src/server.js` — HTTP server entry point (Socket.IO must attach here)

### Controllers (Socket emission points)
- `server/src/controllers/cardController.js` — Card CRUD (create, update, delete)
- `server/src/controllers/listController.js` — List CRUD (create, getLists)
- `server/src/controllers/boardController.js` — Board CRUD

### Frontend State (Socket reception points)
- `client/src/store/slices/boardSlice.js` — Board/List/Card state + optimistic updates
- `client/src/store/index.js` — Redux store configuration
- `client/src/components/KanbanBoard.jsx` — Drag-drop event handlers + local state
- `client/src/pages/Board.jsx` — Board page with team/board context

### Auth & Middleware
- `server/src/middlewares/authMiddleware.js` — JWT protect middleware (reuse for socket auth)
- `client/src/store/slices/authSlice.js` — Auth state with JWT token

### Database Schema
- `server/prisma/schema.prisma` — Card, List, Board models with rank field

</canonical_refs>

<specifics>
## Specific Ideas

### Implementation Order (User-specified, follow EXACTLY)
1. Setup Socket.IO server (attach to HTTP server)
2. Implement board rooms (join/leave)
3. Connect frontend to socket
4. Join/leave board rooms from client
5. Implement ONE event first: `card:create`
6. Test thoroughly
7. Add `card:move` (hardest)
8. Add remaining events: `card:update`, `card:delete`, `list:create`, `list:reorder`

### Common Failure Points to Avoid
- ❌ Emitting before DB update → causes inconsistent state
- ❌ Sending full board data → performance nightmare
- ❌ Not cleaning event listeners → multiple event triggers
- ❌ Mixing API + socket updates blindly → duplicate state bugs

### Constraints (MANDATORY)
- Backend is the only place that emits events
- Events must be board-scoped
- Payload must be minimal
- Redux is the only state updater
- DB is always the source of truth

### Testing Plan (MANDATORY)
- Setup: 2 browsers OR 2 devices
- Test Cases:
  - Card Create: Add card in Browser A → Appears in Browser B instantly
  - Card Move: Move card in A → Moves correctly in B → Order remains correct
  - List Create: Create list in A → Appears in B
  - No duplication: No double cards, no flickering

</specifics>

<deferred>
## Deferred Ideas

- Comments real-time sync (SYNC-03 — user explicitly excluded from Phase 3 scope)
- Presence Service / Facepile (03-03 in roadmap, but user excluded)
- Notifications
- Operation ID-based deduplication (Option B — advanced, not needed for MVP)
</deferred>

---

*Phase: 03-real-time-sync-engine*
*Context gathered: 2026-04-04 from user-provided detailed specifications*
