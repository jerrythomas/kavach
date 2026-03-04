# Sentry

## Overview

The Sentry package (`@kavach/sentry`) enforces role-based access control through declarative routing rules evaluated at request time. Routes are protected by default — only explicitly public or role-matched routes are accessible.

> Note: Renamed from Guardian to Sentry for clearer naming.

## Internal Modules

| Module | Purpose |
|--------|---------|
| `sentry.js` | Main API — createSentry, configureRules, protectRoute |
| `processor.js` | Rule organization — sort by depth, group by role, encode paths |
| `validations.js` | Rule validation — redundancy detection, path format checks |
| `utils.js` | Path matching — depth calculation, prefix matching |
| `types.js` | JSDoc type definitions |

## Architecture

### Initialization

```
createSentry(options)
  ├─ configureRules(options, logger)
  │   ├─ processAppRoutes(options.app) → merge with defaults
  │   ├─ addRulesForAppRoutes() → auto-add login/logout/session as public
  │   ├─ validateRoutingRules() → detect errors and warnings
  │   ├─ processRoutingRules() → sort by depth, URL-encode paths
  │   └─ organizeRulesByRole() → separate public vs protected by role
  └─ Returns: Sentry { app, setSession, protect }
```

### Route Matching Algorithm

Routes are sorted by path depth (deeper first) so specific paths take precedence:

```
/admin/users/profile  (depth 3) — checked first
/admin/users          (depth 2)
/admin                (depth 1) — checked last
```

Matching uses prefix comparison on `/` boundaries:

```
findMatchingRoute(routes, path)
  → routes.find(route => path === route || path.startsWith(`${route}/`))
```

This prevents `/admin` from matching `/admin-panel` — the slash boundary ensures only true sub-paths match.

### Protection Decision Tree

```
protect(path)
  1. Authenticated + at login page → 302 redirect to home
  2. Check restricted routes (routes for other roles) → if match → deny
  3. Check allowed routes → if match → 200 allow
  4. No match:
     - Endpoint route (/api, /data) → return status code (401/403)
     - Page route → 302 redirect (to login if unauthenticated, to home if wrong role)
```

### Rule Organization

After initialization, rules are organized into:

```
{
  public: ['/auth', '/auth/session', '/public/*'],
  protected: {
    '*': ['/dashboard', '/profile'],        // any authenticated user
    'admin': ['/admin', '/admin/*'],         // admin role only
    'moderator': ['/mod', '/mod/*']          // moderator role only
  }
}
```

When `setSession(session)` is called, sentry recalculates:

```
sessionConfig = {
  role: session?.user?.role || null,
  routes: {
    allowed: [...publicRoutes, ...roleRoutes],    // flat array for fast lookup
    restricted: [...otherRoleRoutes]               // routes for other roles
  }
}
```

### Default App Routes

```
{
  home: '/',
  login: '/auth',
  logout: '/logout',
  session: '/auth/session',
  unauthorized: null,        // optional, defaults to home
  endpoints: ['/api', '/data']
}
```

Login and session routes are automatically added as public rules. Endpoint paths get special treatment — they return status codes instead of redirects.

### Rule Validation

Runs at initialization, before any requests:

1. **Path format** — must be non-empty, start with `/`, no empty segments (`/admin//users`)
2. **Redundancy** — child routes with same access as parent are flagged as warnings
3. **Depth calculation** — `path.split('/').length - 1`

Validation issues are logged but don't prevent startup. Errors are surfaced through the logger.

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| All rules in memory, O(n) matching | Rule sets are small (typically <50); no need for trie/radix trees |
| Depth-first sorting | Specific paths checked before general ones; `/admin/public` can override `/admin` |
| Path encoding/decoding | Handles special characters in URLs safely |
| Immutable rule reconfiguration | `setSession()` creates new route lists rather than mutating; thread-safe |
| Fail-secure default | Unmatched paths are denied; only explicit rules grant access |
| Endpoint vs page distinction | API routes get status codes (for programmatic clients); pages get redirects (for browsers) |

## Implementation Checklist

- [ ] Rename package from `@kavach/guardian` to `@kavach/sentry`
- [ ] Update all imports in `kavach` package
- [ ] Update CLI code generation templates
- [ ] Update documentation references
- [ ] Run tests to ensure no regressions

## Dependencies

- `@kavach/logger` — structured logging
- `ramda` — functional utilities
