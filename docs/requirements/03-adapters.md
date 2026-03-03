# 03 — Auth Adapters

## What

Auth adapters are provider-specific implementations of the `AuthAdapter` interface. Each adapter:

- **Wraps an SDK client** — accepts a pre-created provider SDK instance (Supabase client, Firebase Auth, etc.)
- **Normalizes responses** — transforms provider-specific results into the standard `AuthResult` format
- **Handles auth modes** — routes credentials to the correct provider method (OAuth, password, magic link, phone)
- **Manages sessions** — synchronize, listen for auth state changes, parse URL errors

Five adapters exist:

| Adapter | Package | SDK |
|---------|---------|-----|
| Supabase | `@kavach/adapter-supabase` | `@supabase/supabase-js` |
| Firebase | `@kavach/adapter-firebase` | `firebase/auth` |
| Auth0 | `@kavach/adapter-auth0` | `@auth0/auth0-spa-js` |
| Amplify | `@kavach/adapter-amplify` | `aws-amplify` |
| Convex | `@kavach/adapter-convex` | `@convex-dev/auth` |

## Why

Every auth provider has a different API shape:

- Supabase returns `{ data, error }`, Firebase throws exceptions, Auth0 uses redirect flows
- Session formats differ (JWT structure, token naming, user object shape)
- Error codes and messages are provider-specific

Adapters solve this by providing one consistent interface. App code never touches provider SDKs directly — it calls `kavach.signIn(credentials)` and gets back a normalized `AuthResult`.

1. **Provider portability** — swap adapters without changing app code
2. **Consistent error handling** — every provider's errors become `{ type: 'error', message, error: { code, status } }`
3. **Testability** — mock the adapter interface, not provider-specific SDK internals

## Scope

### In scope per adapter
- `getAdapter(client)` factory — accepts pre-created SDK client
- `AuthAdapter` interface implementation: signIn, signUp, signOut, synchronize, onAuthChange, parseUrlError
- `transformResult(result)` — normalize provider response to `AuthResult`
- Auth mode routing: OAuth, password, magic link/OTP, phone
- Optional capabilities: verifyOtp, resetPassword, updatePassword, passkey

### Supabase-specific extras
- `getActions(schema)` — server-side CRUD operations (get, post, put, delete) using Supabase client
- `getLogWriter()` — write logs to a Supabase table

### Out of scope
- SDK client creation/configuration (consumer responsibility)
- Provider-specific admin features (user management, email templates)
- Data operations for non-Supabase adapters (future work)

## Adapter Interface

Every adapter must implement:

```
signIn(credentials)      → Promise<AuthResult>
signUp(credentials)      → Promise<AuthResult>
signOut()                → Promise<void>
synchronize(session)     → Promise<AuthResult>
onAuthChange(callback)   → void
parseUrlError(url)       → AuthError | null
```

Optional methods:
```
verifyOtp(credentials)   → Promise<void>
resetPassword()          → Promise<void>
updatePassword(creds)    → Promise<void>
capabilities             → string[]
```

## Dependencies

All adapters depend on:
- `kavach` (`@kavach/auth`) — core types
- Their respective provider SDK

Supabase adapter additionally depends on:
- `@kavach/query` — filter parsing for data operations
