# Architecture Patterns

**Domain:** Real-Time Collaborative Task Management
**Researched:** 2026-03-30
**Overall confidence:** HIGH

## Recommended Architecture

CollabBoard follows a **Server-Authoritative Real-Time Architecture** using a "Thin Client, Heavy Sync" approach. It avoids the complexity of CRDTs (Conflict-free Replicated Data Types) in favor of a centralized "Source of Truth" model, which is the industry standard for enterprise-grade Kanban tools like Trello and Jira.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Client UI (React)** | Renders Kanban boards, lists, and cards. Handles drag-and-drop interactions and local state updates. | Redux Store, Socket.io Client, REST API |
| **State Manager (Redux)** | Maintains a single source of truth for the local UI state. Performs optimistic updates and reacts to socket events. | Client UI, Socket.io Service |
| **Socket.io Service (Client)** | Encapsulates the socket connection. Dispatches events to the server and feeds incoming updates into the Redux store. | Redux Store, Socket.io Server |
| **REST API (Express)** | Handles stateless operations: JWT-based authentication, team creation, and initial board hydration. | Client UI, Prisma, PostgreSQL |
| **Real-time Server (Socket.io)** | Manages persistent connections, room partitioning, and real-time validation for mutations. | Socket.io Client, Prisma, PostgreSQL |
| **Data Layer (Prisma)** | Type-safe ORM that handles database schema, migrations, and transactional updates. | Express, Socket.io Server |
| **Database (PostgreSQL)** | Relational storage for users, teams, boards, lists, cards, comments, and assignments. | Prisma |

### Data Flow

1. **Initial Load (Hydration)**:
   - User navigates to a Board.
   - Frontend makes a `GET /api/boards/:id` request (REST).
   - Backend fetches the board, its lists, and all nested cards in a single query (Prisma `include`).
   - Frontend populates the Redux store and establishes a Socket.io connection, joining the room `board:${id}`.

2. **Real-time Interaction (e.g., Moving a Card)**:
   - **Optimistic Update**: User drags a card. Redux immediately updates the local UI state for zero-latency feel.
   - **Mutation Event**: Client emits a `card:move` socket event containing `{ cardId, listId, rank }`.
   - **Server Validation**: Backend verifies the user has write access to the board and list.
   - **Persistence**: Backend updates the card's `listId` and `rank` in PostgreSQL using **Fractional Indexing**.
   - **Broadcast**: Backend emits a `card:moved` event to all other clients in the board's room (excluding the sender).
   - **Reconciliation**: If the server update fails (e.g., permission denied), the server emits an `error:card:move` to the original client, triggering a Redux "rollback" to the last known good state.

3. **Presence (Live Awareness)**:
   - When a user joins/leaves a board room, the server broadcasts `presence:update`.
   - Frontend renders active user avatars in the header.

## Patterns to Follow

### Pattern 1: Fractional Indexing (Lexicographical Ranking)
**What:** Assigning string-based ranks (e.g., `"a"`, `"b"`, `"c"`) to cards instead of integer positions (1, 2, 3).
**When:** Any reorderable list (cards in a list, lists on a board).
**Why:** Prevents the "Mass Update" problem. To move a card between rank `"a"` and `"b"`, you simply assign it rank `"an"`. Only **one** database record is updated instead of re-indexing the entire list.
**Implementation:** Use a utility to generate strings that sort lexicographically.

### Pattern 2: Socket.io Rooms for Traffic Isolation
**What:** Partitioning real-time traffic using `socket.join(boardId)`.
**When:** Onboard initialization.
**Example:**
```typescript
socket.on('join-board', (boardId) => {
  // Ensure user is authorized first!
  socket.join(`board:${boardId}`);
});
```
**Why:** Prevents a "noisy neighbor" effect where users get updates for boards they aren't currently viewing.

## Anti-Patterns to Avoid

### Anti-Pattern 1: "Whole State" Synchronization
**What:** Broadcasting the entire board JSON every time a card is moved.
**Why bad:** High bandwidth consumption and high risk of overwriting concurrent changes made by other users (e.g., if User A moves a card and User B edits a title simultaneously).
**Instead:** Always use **Delta Updates** (send only the specific property that changed).

### Anti-Pattern 2: Client-Side "Time-of-Action" Logic
**What:** Letting the client tell the server "move this card to position 5."
**Why bad:** "Position 5" might have changed by the time the message reaches the server.
**Instead:** The client should provide the context needed for the server to determine the final state (e.g., "move between Card X and Card Y").

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Socket Connection** | Single Node.js process is sufficient. | Multi-instance Node.js using **Redis Adapter** for pub/sub. | Distributed cluster with global pub/sub (e.g., Ably or Pusher). |
| **Presence Tracking** | In-memory `Map` in the socket server. | Distributed **Redis** (Sets/Hashes) to track status across nodes. | Specialized Presence Service (Microservice) with edge caching. |
| **Database Access** | Simple PostgreSQL queries. | Connection pooling (PgBouncer) and Read Replicas. | Sharding by `TeamID` or `BoardID` to distribute load. |

## Sources

- [Trello Engineering: How we built Trello](https://blog.trello.com/)
- [Socket.io Documentation: Rooms and Namespaces](https://socket.io/docs/v4/rooms/)
- [Implementing Fractional Indexing](https://observablehq.com/@dgreensp/implementing-fractional-indexing)
- [Redux Toolkit: Optimistic Updates Guide](https://redux-toolkit.js.org/rtk-query/usage/optimistic-updates)
