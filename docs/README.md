# Kavach Documentation

Kavach is a drop-in authentication framework for SvelteKit. It provides a unified API across auth platforms (Supabase, Firebase, Auth0, Amplify, Convex), declarative route protection, and pre-built UI components—so you can add secure authentication to your app in minutes.

## What & Why

Building authentication from scratch is hard. Every platform has a different API shape, session format, and error convention. Kavach normalizes all of this behind a single interface:

- **Switch platforms** — Changing from Supabase to Firebase means swapping one adapter, not rewriting auth logic
- **Declarative route protection** — Define rules once; no scattered `if (!user)` checks in every route
- **Consistent UX** — Same login flow, error handling, and session management regardless of platform
- **Type-safe** — Full TypeScript support with centralized types across all packages

## Auth Flows

Kavach supports multiple authentication flows:

| Flow | Description |
|------|-------------|
| OAuth | Social login (Google, GitHub, etc.) |
| Magic Link / OTP | Passwordless via email or SMS |
| Password | Traditional email/password |
| Passkey | WebAuthn/FIDO2 |

## Features

- [Authentication](docs/features/01-Authentication.md) — Sign in, sign up, password management, session handling
- [Authorization](docs/features/02-Authorization.md) — Route protection, role-based access control
- [Data Access](docs/features/03-DataAccess.md) — Query filters, CRUD operations, file management
- [User Interface](docs/features/04-UserInterface.md) — Auth components, cached logins, smart layout
- [Observability](docs/features/05-Observability.md) — Structured logging, pluggable writers

Features cover **what** and **why**. Design covers **how** and **why**. See [design/](design/README.md) for implementation details.

## Core Features

### Route Protection

- All routes are protected by default
- Public routes must be explicitly configured
- Role-based access control (RBAC) with per-role home pages
- Unauthorized access redirects to login (if not authenticated) or role home (if authenticated but lacks permission)
- API endpoints return appropriate HTTP status codes (401/403)

### Session Management

- Cookie-based session persistence (httpOnly, secure, sameSite)
- Server-side session synchronized with client-side auth state
- Svelte stores for reactive auth state
- Login caching for returning users

## Project Tracking

- [features/](features/) — Features to be supported
- [design/](design/) — Module-level design documents
- [stories/](stories/) — Story specs and backlog dashboard
- [plans/](plans/) — Active plan and archived completed plans
