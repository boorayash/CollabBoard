<!-- GSD:project-start source:PROJECT.md -->
## Project

**CollabBoard**

CollabBoard is a real-time collaborative task management platform designed for teams to organize and track work in a shared digital environment. It provides a Kanban-style system (Boards, Lists, Cards) where team members can manage tasks, assign responsibilities, and see updates instantly as they happen.

**Core Value:** The core value of CollabBoard is seamless, real-time synchronization of task movements across team members, ensuring everyone has an immediate and consistent view of project progress.

### Constraints

- **Tech Stack**: Frontend (React, Redux Toolkit, MUI, Socket.io-client), Backend (Node.js, Express, Prisma, PostgreSQL, Socket.io).
- **Architecture**: Monolithic backend with a separate React frontend.
- **Security**: JWT-based authentication; boards are private by default.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages & Runtime
- **Frontend**: TypeScript / JavaScript (Node.js)
- **Backend**: TypeScript / JavaScript (Node.js)
## Frameworks
- **Frontend**: React (Planned)
- **Backend**: Express (Planned)
## Databases
- **PostgreSQL**: Planned via Prisma ORM
## Key Dependencies (Planned)
- `socket.io`: Real-time communication
- `prisma`: ORM for PostgreSQL
- `@mui/material`: UI components
- `redux-toolkit`: State management
## Configuration
- No implementation configuration files exist yet.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Coding Style
- **Naming**: camelCase for variables/functions, PascalCase for React components (Planned).
- **Types**: Strong typing with TypeScript (Planned).
## Error Handling
- **Backend**: Centralized error-handling middleware (Planned).
- **Frontend**: Error boundaries and toast notifications (Planned).
## State Management
- **Local**: React `useState` / `useContext` for transient UI state.
- **Global**: Redux Toolkit for shared and synchronized application state.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Pattern
- **Monolithic Backend**: Planned Express server.
- **Single Page Application (SPA)**: Planned React frontend.
## Planned Layers
## Data Flow
- Real-time updates flow through Socket.io rooms partitioned by board ID.
- Standard metadata and auth flow through REST API.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
