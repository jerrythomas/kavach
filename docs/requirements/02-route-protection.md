# 02 — Route Protection

## What

The Guardian package (`@kavach/guardian`) provides role-based access control for SvelteKit routing. It:

- **Evaluates route access** — given a path and a session, returns allow (200), redirect (302), unauthorized (401), or forbidden (403)
- **Enforces role-based rules** — routes can require specific roles, any authenticated user, or be marked public
- **Validates configuration** — detects redundant rules, missing routes, and configuration errors at startup
- **Manages role-specific routing** — each role can have its own home page and allowed routes

## Why

Auth without route protection is incomplete. Developers need a way to say "this page requires admin" or "this page is public" without writing `if (session.role !== 'admin')` in every `+page.server.js`. Guardian centralizes this:

1. **Declarative rules** — one array of `{ path, public?, roles? }` replaces scattered imperative checks
2. **Fail-secure** — routes are protected by default; only explicitly public or role-matched routes are accessible
3. **Validation** — catches misconfiguration (overlapping rules, missing role definitions) before runtime

## Scope

### In scope
- `createGuardian(options)` factory
- `protect(path)` — returns `{ status, redirect? }`
- `setSession(session)` — update session and recalculate accessible routes
- App route configuration: home, login, logout, session, endpoints
- Role definitions: per-role home page and route lists
- Routing rules: path, public flag, roles array
- Rule validation: redundancy detection, depth matching, error/warning reporting

### Out of scope
- Session creation/management (handled by core auth)
- Cookie handling (handled by core auth)
- UI feedback for access denied (handled by UI components or app code)

## Key Types

| Type | Purpose |
|------|---------|
| `GuardianOptions` | Configuration: app routes, roles, rules, logger |
| `AppRoute` | Well-known paths: home, login, logout, session, endpoints |
| `RoleRoute` | Per-role config: home page, allowed routes |
| `RoutingRule` | Single rule: path, public?, roles?, depth? |
| `ProtectResult` | Evaluation result: status (200/302/401/403), redirect? |

## Protection Logic

```
Request path → Is public? → 200
            → Has session? → No → 302 to login
            → Has required role? → No → 302 to role home (or 403)
            → 200
```

## Dependencies

- `@kavach/logger` — structured logging
- `ramda` — functional utilities
