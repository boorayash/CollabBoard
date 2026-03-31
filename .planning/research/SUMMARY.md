# Project Research Summary

**Project:** CollabBoard
**Domain:** Real-Time Collaborative Task Management (Kanban)
**Researched:** 2026-03-31
**Confidence:** HIGH

## Executive Summary

CollabBoard is a multiplayer Kanban platform where the primary technical challenge is maintaining perfect real-time synchronization of task state across all connected clients. Research indicates that while CRDTs (Conflict-free Replicated Data Types) provide the most robust offline-first experience, a **Server-Authoritative Socket.io** model is more appropriate for an MVP, balancing development speed with professional-grade responsiveness.

The recommended strategy for this project is a tiered implementation: **"First make it work → then make it real-time → then make it beautiful."** This ensures a stable REST-based CRUD foundation before layering on the complexity of WebSocket synchronization and advanced UI/UX polish.

## Key Findings

### Recommended Stack

Based on [STACK.md](file:///d:/CollabBoard/.planning/codebase/STACK.md), the project will use a modern, full-stack JavaScript ecosystem.

**Core technologies:**
- **React + Redux Toolkit**: For predictable client-side state and optimistic updates.
- **Node.js + Express**: To provide a stable monolithic REST API.
- **Prisma + PostgreSQL**: For type-safe relational data management and robust transactional integrity.
- **Socket.io**: To handle real-time event broadcasting and board-level rooms.
- **Material UI**: For a polished, professional component library and responsive design.

### Expected Features

From [FEATURES.md](file:///d:/CollabBoard/.planning/research/FEATURES.md):

**Must have (table stakes):**
- **Instant Real-Time Sync**: Expected <100ms updates for card movements.
- **Kanban Flow**: Drag-and-drop lists and cards.
- **Presence Indicators**: Showing active users on a board ("facepiles").
- **Optimistic UI**: Zero-latency local feedback on actions.
- **Basic Metadata**: Assignments, priorities, and due dates.

**Differentiators:**
- **Keyboard-First UX**: Linear-style command palette and shortcuts.
- **Live Focus Indicators**: Seeing exactly which field someone else is editing.

### Architecture Approach

From [ARCHITECTURE.md](file:///d:/CollabBoard/.planning/research/ARCHITECTURE.md):

The system follows a **Thin Client, Heavy Sync** pattern. The server acts as the final arbiter of truth, validating all mutations before broadcasting them to other clients.

**Major components:**
1. **REST API**: Handles auth, team management, and initial board state hydration.
2. **Socket.io Server**: Manages board-specific rooms and broadcasts surgical delta updates.
3. **Redux Store**: Serves as the single source of truth on the client, managing optimistic updates and rollbacks.

### Critical Pitfalls

From [PITFALLS.md](file:///d:/CollabBoard/.planning/research/PITFALLS.md):

1. **"Teleporting Cards"**: Race conditions during simultaneous moves. **Fix:** Use Fractional Indexing for ranking.
2. **"Last Write Wins"**: Silently overwriting data. **Fix:** Implement field-level updates and optimistic locking.
3. **Permission Desync**: Unauthorized access via persistent sockets. **Fix:** Re-validate JWT/Roles on every socket event.

## Implications for Roadmap

Based on research and user-defined priorities, the roadmap follows a four-phase structure for Milestone 1.

### Phase 1: Core Kanban System
**Rationale:** Establishing a stable REST foundation is critical before adding real-time complexity.
**Delivers:** Auth, Team management, and basic Board/List/Card CRUD using standard REST APIs.
**Avoids:** Early-stage debugging chaos associated with raw WebSocket state desync.

### Phase 2: Backend Stability & RBAC
**Rationale:** Ensures data integrity and security patterns are solid.
**Delivers:** Refined PostgreSQL schema and Role-Based Access Control (Admin vs. Member).
**Uses:** Prisma for schema enforcement and Express middleware for RBAC.

### Phase 3: Real-Time Sync Engine
**Rationale:** The "Core Highlight" feature that makes the app feel "alive."
**Delivers:** Socket.io integration for card movement, creation, and comments.
**Avoids:** Race conditions via Fractional Indexing implementation.

### Phase 4: UI/UX Polish
**Rationale:** Premium aesthetic is a table stake for modern productivity tools.
**Delivers:** Material UI styling, responsive layouts, and smooth micro-animations.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Standard MERN-adjacent stack with proven real-time patterns. |
| Features | HIGH | Well-defined competitive landscape (Linear/Trello). |
| Architecture | HIGH | Server-authoritative model is reliable and scalable for MVP. |
| Pitfalls | HIGH | Common real-time issues are well-documented with known fixes. |

**Overall confidence:** HIGH

---
*Research completed: 2026-03-31*
*Ready for roadmap: yes*
