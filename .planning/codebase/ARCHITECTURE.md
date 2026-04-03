# Codebase Architecture

**Analysis Date:** 2026-03-31
**Status:** Greenfield (Pre-implementation)

## System Pattern
- **Monolithic Backend**: Planned Express server.
- **Single Page Application (SPA)**: Planned React frontend.

## Planned Layers
1. **Frontend UI**: Material UI components.
2. **Client State**: Redux Toolkit for local and synced state.
3. **Real-Time Sync**: Socket.io client/server events.
4. **API Layer**: REST endpoints for CRUD operations.
5. **Persistence**: Prisma ORM with PostgreSQL.

## Data Flow
- Real-time updates flow through Socket.io rooms partitioned by board ID.
- Standard metadata and auth flow through REST API.
