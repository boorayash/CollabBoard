# Requirements: CollabBoard

**Defined:** 2026-03-31
**Core Value:** Seamless, real-time synchronization of task movements across team members.

## v1 Requirements

### Authentication & Teams
- [ ] **AUTH-01**: User can sign up with email and password.
- [ ] **AUTH-02**: User can log in and receive a secure JWT.
- [ ] **AUTH-03**: User can create a Team and become its Admin.
- [ ] **AUTH-04**: Admin can invite other users to the Team (Member role).

### Kanban Core (REST)
- [ ] **BOARD-01**: User can create, view, edit, and delete Boards within a Team.
- [ ] **LIST-01**: User can create, view, edit, and delete Lists within a Board (e.g., To Do, Doing, Done).
- [ ] **CARD-01**: User can create, view, edit, and delete Cards within a List.
- [ ] **MOVE-01**: User can move cards between lists and reorder within a list (via REST API).

### Backend & Security
- [ ] **DB-01**: PostgreSQL schema with proper relations and foreign keys (Prisma).
- [ ] **API-01**: Well-structured REST endpoints for all CRUD operations.
- [ ] **RBAC-01**: Role-based access control (Admin has full control; Member can manage tasks but not teams).

### Real-Time Sync (Socket.io)
- [ ] **SYNC-01**: Card movements (drag-and-drop) sync instantly across all clients in the same board.
- [ ] **SYNC-02**: Card creation and deletion sync instantly across all clients.
- [ ] **SYNC-03**: Comments on cards sync instantly across all clients.
- [ ] **SYNC-04**: Users are joined to board-specific rooms for traffic isolation.

### UI/UX Polish
- [ ] **UI-01**: Responsive layout using Material UI (MUI).
- [ ] **UI-02**: Smooth drag-and-drop experience with visual feedback.
- [ ] **UI-03**: Facepile presence indicators showing active users on a board.

## v2 Requirements (Phase 2+)
- **GOOG-01**: Google Calendar integration for due dates.
- **NOTF-01**: Email notifications for assignments and mentions.
- **ANLY-01**: Advanced analytics dashboard for team productivity.
- **PUBL-01**: Public boards and guest access roles.
- **AI-01**: AI-powered task clustering and duplicate detection.

## Out of Scope
| Feature | Reason |
|---------|--------|
| Collaborative Text Editing | Avoid complexity of CRDTs/OTs in MVP (Google Docs style). |
| In-App Direct Chat | Defer to dedicated tools like Slack/Discord. |
| Granular Permissions | Stick to Admin/Member roles for simplicity in MVP. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01, 02, 03, 04 | Phase 1 | Pending |
| BOARD-01, LIST-01, CARD-01 | Phase 1 | Pending |
| MOVE-01 | Phase 1 | Pending |
| DB-01, API-01 | Phase 1/2 | Pending |
| RBAC-01 | Phase 2 | Pending |
| SYNC-01, 02, 03, 04 | Phase 3 | Pending |
| UI-01, 02, 03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
