# Auth UI: Cached Logins, Smart Layout, and Passkey Support

## Overview

Enhance `@kavach/ui` with cached login cards, a smart auth page layout, and passkey support. Existing components remain unchanged — new components compose them.

## Login Cache Module (`packages/auth`)

A `loginCache` module manages previously successful logins in `localStorage` under the key `kavach:logins`. Browser-only; no-ops on server.

### Cache Entry Shape

```js
{
  email: 'user@example.com',
  name: 'Jerry Thomas',
  avatar: 'https://...',
  provider: 'azure',
  mode: 'oauth',            // oauth | password | otp | passkey
  hasPasskey: false,
  lastLogin: 1709337600000
}
```

### Utility Functions

- `get()` — returns cached entries sorted by `lastLogin` descending
- `set(entry)` — upserts an entry by email; max 5 entries, oldest evicted
- `remove(email)` — removes a single entry
- `clear()` — removes all entries

### Kavach Instance API

```js
kavach.getCachedLogins()        // returns cached entries
kavach.removeCachedLogin(email) // removes one
kavach.clearCachedLogins()      // removes all
```

Caching happens automatically after successful `signIn` or `onAuthChange` events. The kavach instance calls the cache module internally.

## New UI Components (`packages/ui`)

### LoginCard

A single cached login entry.

- **Props:** `email`, `name`, `avatar`, `provider`, `mode`, `hasPasskey`, `onclick`, `onremove`
- **Renders:** avatar image, name, provider badge icon (`logo-{provider}`), passkey icon (if `hasPasskey`), remove button (x)
- **Interactions:** click card → `onclick({ email, provider, mode })` re-authenticates; click remove → `onremove(email)`; click passkey icon → passkey auth instead of default provider flow

### LoginCardList

Renders a list of `LoginCard` components.

- **Props:** `logins` (array of cache entries), `onclick`, `onremove`
- **Empty state:** renders nothing

### AuthPage

Smart layout orchestrator — the main component apps use for auth pages.

- **Props:** `providers` (array of provider configs, same format as AuthHandler)
- Reads `kavach` from context, calls `kavach.getCachedLogins()`
- **Cached logins exist:** shows `LoginCardList` at top, then collapsible "Other sign-in options" with provider groups (social buttons, magic link form, password form)
- **No cached logins:** shows provider groups directly (social, divider, magic link, divider, password)
- Handles success/error callbacks and updates `authStatus`
- Uses existing `AuthProvider` internally — no duplication

### Exports

All three new components exported from `@kavach/ui` alongside existing components. Existing `AuthProvider`, `AuthButton`, `AuthGroup`, `AuthHandler`, `AuthError`, `AuthResponse` remain unchanged.

## Passkey Support

### Auth Mode

New `'passkey'` mode alongside `'oauth'`, `'otp'`, `'password'`.

### Adapter Capabilities

Adapters gain an optional `capabilities` array:

```js
return {
  signIn, signUp, signOut, synchronize, onAuthChange, parseUrlError,
  capabilities: ['passkey']  // optional, defaults to []
}
```

### Credential Shape

```js
kavach.signIn({ mode: 'passkey', email: 'user@example.com' })
```

The adapter's `signIn` routes on `mode === 'passkey'` and calls the SDK's WebAuthn method. Adapters without passkey capability don't list it — the UI won't show the option.

### UI Integration

- `LoginCard` shows passkey icon when `hasPasskey: true`; clicking icon triggers passkey auth
- `AuthPage` checks adapter capabilities to decide whether to show passkey option in provider sections
- No passkey registration UI in this iteration (future: settings/profile)

### Adapter Coverage

This iteration: wire passkey in Firebase adapter only (best SDK support). Other adapters gain passkey in future iterations.

## Testing

### Login Cache (`packages/auth`)

- `loginCache.js` unit tests: get/set/remove/clear, max 5 eviction, sort by lastLogin, server no-ops
- Kavach integration: verify cache updated after successful signIn and onAuthChange
- Mock `localStorage` in tests

### New UI Components (`packages/ui`)

- `LoginCard`: renders avatar/name/provider/passkey icon, click/remove callbacks
- `LoginCardList`: renders multiple cards, empty state
- `AuthPage`: cached logins → cards + collapsible; no cache → direct providers; passkey shown only with adapter capability

### Passkey

- Firebase adapter: `signIn({ mode: 'passkey', email })` calls correct SDK method
- Adapters without `capabilities` default to empty array

### Existing Components

No changes — existing tests unaffected.
