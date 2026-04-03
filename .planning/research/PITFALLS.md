# Domain Pitfalls: Real-Time Collaborative Task Management

**Domain:** Collaborative Project Management (Kanban)
**Researched:** 2024-05-22
**Overall confidence:** HIGH

## Critical Pitfalls

Mistakes that cause rewrites or major data integrity issues.

### Pitfall 1: The "Teleporting Card" Race Condition
**What goes wrong:** Two users move the same card to different columns or positions simultaneously.
**Why it happens:** Without a conflict resolution strategy (CRDT/OT), the server processes the first event and then the second. The second event might contain stale context (e.g., "moving from Todo to Done" when the card is already in "Doing").
**Consequences:** Cards "teleport" or jump between columns erratically, causing user confusion and loss of work context. In worst cases, cards can disappear if the frontend state becomes corrupted.
**Prevention:** Use **Fractional Indexing** (lexicographical ranking) for positions. Emit surgical `move` events (Card ID, Target List ID, Target Position) rather than whole state objects. Implement server-side validation that checks if the move is valid based on the current (not cached) state.
**Detection:** Multiple "Move" events received for the same card within a <100ms window; user complaints about "jumping cards."

### Pitfall 2: The "Last Write Wins" Data Overwrite
**What goes wrong:** User A is editing a card description. User B changes the card's priority. User A saves, and their payload (which still has the old priority) overwrites User B's change.
**Why it happens:** Naive implementations send the entire object on every update.
**Consequences:** Silent data loss. Users feel they "lost" their changes, leading to lack of trust in the platform.
**Prevention:** **Field-Level Updates.** Backend API and Socket.io events must only accept the specific fields that changed (e.g., `{ description: "..." }`). Use **Optimistic Locking** (version numbers) on the database level to reject updates based on stale versions.
**Detection:** Database audit logs showing fields reverting to previous values shortly after an update.

### Pitfall 3: Permission Desync & Socket Leakage
**What goes wrong:** A user is removed from a team or demoted to "viewer," but their active WebSocket connection remains open and authorized.
**Why it happens:** Authorization is often only checked during the initial Socket.io handshake (JWT at connection time), but not re-validated for every event.
**Consequences:** Unauthorized users can continue to move cards or view private updates until they refresh their browser. Major security risk.
**Prevention:** Re-validate user permissions against the database for *every* incoming Socket.io event that modifies state. Implement a "Force Re-auth" or "Disconnect" broadcast when a user's roles are changed.
**Detection:** Security audits showing successful `card:move` events from users who no longer have "Member" status.

## Moderate Pitfalls

### Pitfall 1: The "Ghost" Cursor & Input Focus Loss
**What goes wrong:** While a user is typing in a task description, a real-time update (e.g., a comment or a due date change) causes the React component to re-render, snapping the focus out of the text field or moving the cursor to the end.
**Prevention:** Decouple local input state from real-time sync state. Use a "controlled" input that only updates from the sync-state when the field is NOT focused, or use `refs` to manage cursor position during external updates.
**Detection:** Users reporting "stuttering" or "losing focus" while typing in collaborative boards.

### Pitfall 2: Socket.io "Fan-out" Performance Bottlenecks
**What goes wrong:** The server broadcasts every single card movement to every connected user in the entire application.
**Prevention:** Use **Rooms** (e.g., `board_123`). Only broadcast events to users currently viewing that specific board. Throttle non-critical updates (like "User X is typing") to avoid flooding the network.
**Detection:** High egress bandwidth costs; laggy UI updates when many users are active on different boards; high CPU usage on the client-side due to processing irrelevant events.

### Pitfall 3: Reconnection State Drift
**What goes wrong:** A user's Wi-Fi blips for 5 seconds. During that time, 10 changes happen on the board. When they reconnect, their UI is 10 steps behind and stays that way.
**Prevention:** Implement a **Reconciliation Loop**. On Socket.io `reconnect`, the client must re-fetch the current state of the board or request a "delta" since their last known sequence number/timestamp.
**Detection:** Users seeing "out-of-sync" boards that only fix themselves after a manual page refresh.

## Minor Pitfalls

### Pitfall 1: Notification Fatigue
**What goes wrong:** Users receive a notification for every minor character change or position shift they made themselves.
**Prevention:** Filter out the sender's own socket ID from broadcasts. Batch notifications (e.g., "5 changes were made to Card X") instead of individual pings for every field update.
**Detection:** Users muting the tab or complaining about "too many pings."

### Pitfall 2: Lack of Presence Awareness
**What goes wrong:** Two users start working on the same sub-task because they don't realize the other person is also looking at it.
**Prevention:** Simple "Who's here" indicators (avatars at the top of the board) and "User X is viewing/editing" badges on cards.
**Detection:** Frequent manual communication ("Hey, are you working on task X?") despite using the tool.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Real-Time Infrastructure** | Permission Desync | Middleware for Socket.io that re-validates JWT/Roles on every event. |
| **Kanban Interface** | Teleporting Cards | Use fractional indexing (strings) for sorting instead of integer indices. |
| **Core Backend & Sync** | Last Write Wins | Implement surgical field updates (Prisma `update` with only changed keys). |
| **Task Details** | Input Focus Loss | Use local state for `textarea` and only sync on `blur` or via throttled "patch" events. |
| **Error Handling** | Reconnection Drift | Trigger a board re-fetch on the `connect` event if it's a re-connection. |

## Sources

- [Socket.io Documentation on Rooms & Scaling](https://socket.io/docs/v4/rooms/)
- [Prisma Concurrency & Transactions Guide](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)
- [Implementing Fractional Indexing for Kanban](https://observablehq.com/@dgreensp/implementing-fractional-indexing)
- [Managing Real-time focus in React](https://react.dev/learn/manipulating-the-dom-with-refs#accessing-another-components-dom-nodes)
- [Common pitfalls of collaborative editing (Figma/Trello case studies)](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
