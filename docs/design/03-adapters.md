# Adapters

Auth adapters are platform-specific implementations that wrap external auth SDKs behind a unified interface. They enable Kavach to be platform-agnostic while maintaining a consistent API for applications.

## BaseAdapter Pattern

Every adapter extends `BaseAdapter` from the core `kavach` package:

- **Response normalization** — `transformResult()` converts platform-specific responses to `AuthResult`
- **Subscription handling** — `handleSubscription()` wraps platform auth change listeners
- **Client/options wiring** — Standard constructor signature

## Core Interface

All adapters must implement:

- `signIn(credentials)` — Authenticate user with provided credentials
- `signUp(credentials)` — Create a new user account
- `signOut()` — End the current session
- `synchronize(session)` — Refresh tokens and update session
- `onAuthChange(callback)` — Listen for auth state changes
- `parseUrlError(url)` — Extract errors from OAuth redirect URLs

### Auth

Every adapter provides user authentication via OAuth, password, magic link, or phone/OTP flows. This is the core capability that all adapters implement.

### Data Layer

Supabase and Firebase provide built-in database services. Kavach exposes a unified Data API across these platforms, enabling quick data access without writing custom backend APIs. The Data API supports CRUD operations with filter parsing via `@kavach/query`.

Typical UI projects often need quick data access for demos, prototypes, or admin panels. Instead of building custom APIs, apps can leverage Kavach's Data API for table-level access.

### File Layer

Supabase and Firebase offer object storage. Kavach provides a unified File API for upload, download, and delete operations. This enables handling user uploads, avatars, and document storage without platform-specific code.

### Logging Layer

Client-side console logs are not available on the server, making it difficult for support teams to debug issues reported by users. Kavach's Logging Layer solves this by supporting different writers:

- **Console writer** — Development logging
- **HTTP writer** — Send logs to any backend endpoint
- **Supabase writer** — Write structured logs to a database table

Apps can configure how UI logs are processed. Logs can be sent to a backend endpoint for real-time debugging without requiring users to reproduce the issue. The Supabase writer writes directly to a database table for persistent log storage.

## Supported Adapters

### Capabilities

All adapters provide authentication as the primary capability. Beyond auth, Kavach offers optional layers for data, files, and logging that leverage the underlying platform's built-in services.

| Provider | Auth | Data | File | Logger |
|----------|:----:|:----:|:----:|:------:|
| Supabase | ✓ | ✓ | ✓ | ✓ |
| Firebase | ✓ | ✓ | ✓ | TODO |
| Auth0 | ✓ | -NA- | -NA- | -NA- |
| Amplify | ✓ | -NA- | -NA- | -NA- |
| Convex | ✓ | TODO | -NA- | -NA- |

### Auth Flows

| Provider | OAuth | Password | Passwordless | Passkey |
|----------|:-----:|:--------:|:-----------:|:-------:|
| Supabase | ✓ | ✓ | ✓ | -NA- |
| Firebase | ✓ | ✓ | -NA- | -NA- |
| Auth0 | ✓ | ✓ | ✓ | -NA- |
| Amplify | ✓ | ✓ | -NA- | -NA- |
| Convex | ✓ | ✓ | -NA- | -NA- |

## Demo Mode

The CLI can generate a virtual `$kavach/auth` module that supports runtime adapter switching for testing.

## Dependencies

- `kavach` — Core types and BaseAdapter
- Platform SDK — Each adapter depends on its respective SDK

## Design Decisions

1. **Class-based adapters** — Enable extension, testing, and consistent instantiation
2. **Factory functions** — `getAdapter()` exports for backward compatibility
3. **Fail-secure** — Unknown platforms or errors default to auth failure

## References

- [Supabase JS](https://supabase.com/docs/reference/javascript)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Auth0 SPA SDK](https://auth0.github.io/auth0-spa-js)
- [AWS Amplify](https://docs.amplify.aws/javascript/)
- [Convex](https://docs.convex.dev/)
- [@convex-dev/auth](https://docs.convex.dev/auth)
