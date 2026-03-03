# 01 — Core Authentication

## What

Kavach is a drop-in authentication framework for SvelteKit applications. The core `kavach` package (`@kavach/auth`) provides:

- **Session management** — track authenticated state across client and server via cookies and Svelte stores
- **Credential-based auth flow** — unified API for sign-in, sign-up, and sign-out across any auth provider
- **SvelteKit hook integration** — a `handle()` function that plugs into `hooks.server.js` to protect routes, parse sessions from cookies, and synchronize auth state on every request
- **Login caching** — remember previous logins on the client (email, provider, avatar) for faster re-authentication
- **Avatar utilities** — derive Gravatar URLs and display names from email addresses

## Why

Web apps need authentication, but every auth provider has a different API shape, session format, and error convention. Kavach normalizes all of this behind a single interface so that:

1. **Switching providers is cheap** — changing from Supabase to Firebase means swapping one adapter, not rewriting auth logic throughout the app
2. **Route protection is declarative** — developers define rules, not imperative checks scattered across routes
3. **Session state is consistent** — one store, one cookie format, one set of types regardless of provider

## Scope

### In scope
- `createKavach(adapter, options)` factory
- `authStatus` Svelte store for reactive auth state
- Credential types: email/password, OAuth, magic link/OTP, phone
- Cookie-based session persistence (httpOnly, secure, sameSite)
- URL hash error parsing (for OAuth redirect errors)
- Login cache (localStorage, max 5 entries)
- Gravatar and name derivation utilities

### Out of scope
- Route protection logic (see [02-route-protection](02-route-protection.md))
- Provider-specific SDK calls (see [03-adapters](03-adapters.md))
- Query/data operations (see [04-query](04-query.md))
- UI components (see [05-ui](05-ui.md))

## Key Types

| Type | Purpose |
|------|---------|
| `AuthCredentials` | Input for signIn/signUp: provider, email, password, phone, redirectTo, scopes |
| `AuthSession` | Authenticated session: user, access_token, refresh_token, expires_in |
| `AuthUser` | User identity: id, role, email, name |
| `AuthResult` | Response envelope: type (success/error/info), message, data, error |
| `AuthAdapter` | Provider interface: signIn, signUp, signOut, synchronize, onAuthChange, parseUrlError |

## Dependencies

- `@kavach/guardian` — route protection
- `@kavach/cookie` — cookie parse/serialize (ESM fork of jshttp/cookie)
- `@kavach/hashing` — MD5 for Gravatar
- `@kavach/logger` — structured logging
- `ramda` — functional utilities
