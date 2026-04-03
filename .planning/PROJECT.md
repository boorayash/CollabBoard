# CollabBoard

## What This Is

CollabBoard is a real-time collaborative task management platform designed for teams to organize and track work in a shared digital environment. It provides a Kanban-style system (Boards, Lists, Cards) where team members can manage tasks, assign responsibilities, and see updates instantly as they happen.

## Core Value

The core value of CollabBoard is seamless, real-time synchronization of task movements across team members, ensuring everyone has an immediate and consistent view of project progress.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **Real-Time Board Sync**: Instant updates for card movements, creation, deletion, and comments using Socket.io.
- [ ] **Kanban System**: Interactive boards with lists (To Do, In Progress, Done) and task cards.
- [ ] **Drag-and-Drop Interface**: Smooth task movement between lists and reordering within lists.
- [ ] **Team & User Management**: Secure JWT-based authentication and team creation.
- [ ] **Role-Based Access Control**: Admin (full control) and Member (task management) roles within teams.
- [ ] **Task Details**: Assignments, due dates, priority levels, file attachments, and comments.
- [ ] **Notification System**: Real-time alerts for assignments and updates.
- [ ] **Analytics Dashboard**: Visual insights into task completion and team productivity.

### Out of Scope

- **Collaborative Text Editing** — Real-time Google Docs style editing inside descriptions is deferred to avoid complexity of CRDTs/OTs in MVP.
- **Public Boards** — All boards are private to teams for security and simplicity in MVP.
- **Guest Access** — Access is restricted to registered team members.
- **Granular Permissions** — Only Admin and Member roles are supported for initial release.

## Context

CollabBoard aims to be a high-performance demonstration of full-stack real-time capabilities. It targets teams looking for a centralized, "alive" workspace that eliminates communication gaps.

## Constraints

- **Tech Stack**: Frontend (React, Redux Toolkit, MUI, Socket.io-client), Backend (Node.js, Express, Prisma, PostgreSQL, Socket.io). **Only JavaScript is used (No TypeScript).**
- **Architecture**: Monolithic server with a separate React client.
- **Security**: JWT-based authentication; boards are private by default.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Real-Time Strategy | Board-level sync via Socket.io (no CRDTs) | — Pending |
| Database / ORM | PostgreSQL + Prisma for type-safe relational data | — Pending |
| UI Framework | Material UI + dnd-kit for drag-and-drop | — Pending |
| State Management | Redux Toolkit for predictable client-side state sync | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 30 March 2026 after initialization*
