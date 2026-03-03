# 01 — Core Authentication Design

## Overview

The `kavach` package (`@kavach/auth`) orchestrates authentication through adapter composition, cookie-based session persistence, and SvelteKit hook integration. It owns no provider logic — all auth operations delegate to an injected adapter.

## Internal Modules

| Module | Purpose |
|--------|---------|
| `kavach.js` | Main factory and orchestration — createKavach, signIn/signUp/signOut, handle hook |
| `provider.js` | Provider configuration, user data extraction from adapter responses |
| `request.js` | Request body/data parsing for SvelteKit endpoints |
| `loginCache.js` | Client-side login history in localStorage |
| `internal.js` | Low-level utilities — URL hash parsing, cookie read/write |
| `avatar.js` | Gravatar URL and display name derivation |
| `constants.js` | Configuration defaults |
| `types.js` | JSDoc type definitions |

## Architecture

### Agent Composition

`createKavach(adapter, options)` creates an "agents" object containing all internal dependencies:

```
createKavach(adapter, options)
  ├─ getAgents(options) → { logger, guardian, invalidateAll }
  ├─ Subscribe to page changes (browser only)
  └─ Return public API: { signIn, signUp, signOut, handle, getCachedLogins, ... }
```

Guardian and logger are created once at initialization. The adapter is passed through to every operation but never stored globally — each function receives it explicitly.

### Authentication Flow

```
signIn(credentials) or signUp(credentials)
  ├─ adapter.signIn(credentials) or adapter.signUp(credentials)
  ├─ authStatus.set(result) → updates Svelte store
  ├─ loginCache.set(entry) → stores in localStorage (browser + success only)
  └─ Returns AuthResponse { type, message, error, data, credentials }
```

Credentials are never mutated. The adapter receives them as-is and returns a normalized `AuthResult`.

### SvelteKit Handle Hook

The `handle()` method plugs into `hooks.server.js` and runs on every server request:

```
handle({ event, resolve })
  1. Parse session from cookies → event.locals.session
  2. guardian.setSession(session) → recalculate allowed routes
  3. If session endpoint (e.g., /auth/session):
     ├─ adapter.synchronize(session) → refresh tokens
     ├─ Set updated cookies
     └─ Return session JSON
  4. Else:
     ├─ guardian.protect(path) → { status, redirect? }
     ├─ 200 → resolve(event)
     ├─ 302 → redirect response
     └─ 401/403 → error response
```

### Session Management

**Cookie-based, stateless.** No in-memory session store.

Session shape in cookies (httpOnly, secure, sameSite=strict):
```
{
  refresh_token: string,
  access_token: string,
  user: { id, role, email, avatar_url, full_name, app_metadata }
}
```

**Synchronization:** On the client, `adapter.onAuthChange(callback)` fires when the provider detects a state change (e.g., OAuth redirect return). The callback POSTs to the session endpoint, which calls `adapter.synchronize()` to refresh tokens and update cookies. After the POST completes, `invalidateAll()` refreshes SvelteKit loaders.

### Login Cache

Browser-only module (`loginCache.js`) using localStorage under `kavach:logins`.

- **Max entries:** 5 (oldest evicted by `lastLogin` timestamp)
- **Deduplication:** case-insensitive email matching
- **Automatic:** cache updated after successful signIn and onAuthChange events
- **Server:** all operations no-op on server (SSR safe)

Entry shape:
```
{ email, name, avatar, provider, mode, lastLogin, hasPasskey? }
```

### Auth Status Store

`authStatus` is a Svelte writable store holding the latest auth result:

```
{ type: 'success'|'error'|'info'|'warning', message?, error?, data?, credentials? }
```

UI components subscribe to this store for reactive feedback. Updated after every signIn, signUp, and signOut operation.

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Stateless cookies over server sessions | No server state to manage; scales horizontally; works with SvelteKit's edge-first model |
| Adapter receives credentials as-is | No credential transformation — preserves provider-specific options without kavach needing to know about them |
| Guardian + logger created once at init | Avoid per-request allocation; configuration doesn't change between requests |
| Login cache in localStorage | Survives page refreshes; no server round-trip; private to the browser |
| `invalidateAll()` after auth change | SvelteKit's load functions re-run, ensuring all server data reflects the new session |
