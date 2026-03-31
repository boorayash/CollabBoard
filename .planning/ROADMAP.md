# Roadmap: CollabBoard

## Overview

CollabBoard's journey focuses on building a rock-solid functional foundation first, then layering real-time multiplayer capabilities on top, and finally polishing the experience to a premium standard. The primary goal of the v1.0 MVP is to provide teams with a reliable, "alive" workspace for task management.

## Strategy: "First make it work → then make it real-time → then make it beautiful."

## Phases

- [ ] **Phase 1: Core Kanban System** - Foundation with REST-based Auth and CRUD operations.
- [ ] **Phase 2: Backend Stability & RBAC** - Relational data integrity and role-based security.
- [ ] **Phase 3: Real-Time Sync Engine** - Multiplayer synchronization via Socket.io.
- [ ] **Phase 4: UI/UX Polish** - Premium Material UI styling and smooth interactions.

## Phase Details

### Phase 1: Core Kanban System
**Goal**: Deliver a fully functional (non-real-time) Kanban board with authentication and team management.
**Depends on**: Nothing
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, BOARD-01, LIST-01, CARD-01, MOVE-01
**Success Criteria**:
  1. User can register, log in, and create a team.
  2. User can create boards, lists, and cards via a React frontend.
  3. User can move cards between lists (persistent via REST API).
  4. Local state feels instantaneous (optimistic updates).
**Plans**: 4 plans
- [ ] 01-01: **Auth & Team Setup**: Backend JWT auth + Team/User management APIs.
- [ ] 01-02: **Kanban Backend**: REST endpoints for Board, List, and Card CRUD.
- [ ] 01-03: **Kanban Frontend Foundation**: React/Redux structure + Basic Board rendering.
- [ ] 01-04: **Core Interactions**: Card creation/editing + Basic drag-and-drop (REST).

### Phase 2: Backend Stability & RBAC
**Goal**: Refine the data model and implement secure role-based access.
**Depends on**: Phase 1
**Requirements**: DB-01, API-01, RBAC-01
**Success Criteria**:
  1. Database schema is fully normalized and managed via Prisma.
  2. Admin can manage team members; Members can only manage tasks.
  3. All API endpoints are protected by role-aware middleware.
**Plans**: 2 plans
- [ ] 02-01: **Database Hardening**: Finalize Prisma schema and relations.
- [ ] 02-02: **RBAC Implementation**: Team role middleware and Admin UI.

### Phase 3: Real-Time Sync Engine
**Goal**: Transform the app into a multiplayer experience with Socket.io.
**Depends on**: Phase 2
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04
**Success Criteria**:
  1. Card movements sync instantly across multiple browser sessions.
  2. Card creation/deletion appears for all users on a board without refresh.
  3. Comments appear in real-time.
  4. Board-specific rooms prevent data leakage between boards.
**Plans**: 3 plans
- [ ] 03-01: **Socket Infrastructure**: Server/Client setup + Room partitioning.
- [ ] 03-02: **Change Broadcasting**: Syncing card moves and CRUD events.
- [ ] 03-03: **Presence Service**: "Facepile" indicators for active users.

### Phase 4: UI/UX Polish
**Goal**: Elevate the visual design and interactivity to a premium standard.
**Depends on**: Phase 3
**Requirements**: UI-01, UI-02, UI-03
**Success Criteria**:
  1. Application follows a cohesive theme using Material UI.
  2. Drag-and-drop feels smooth with high-quality transitions.
  3. Layout is fully responsive (Mobile/Tablet/Desktop).
**Plans**: 2 plans
- [ ] 04-01: **Design System Implementation**: Global theme + UI components.
- [ ] 04-02: **Micro-interactions**: Success/Error states + Board animations.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Kanban | 0/4 | Not started | - |
| 2. Backend & RBAC | 0/2 | Not started | - |
| 3. Real-Time Sync | 0/3 | Not started | - |
| 4. UI/UX Polish | 0/2 | Not started | - |

---
*Roadmap defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
