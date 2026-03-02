# Auth UI Redesign

## Goal

Modernize the `@kavach/ui` component library with passkey support, cached login cards, and a cleaner separation of auth modes.

## Current State

The UI package (`packages/ui/`) has 6 exported Svelte components:
- `AuthProvider` — orchestrates OAuth/OTP/password modes
- `AuthPassword` — email + password form
- `AuthButton` — provider button
- `AuthHandler`, `AuthError`, `AuthResponse`, `AuthGroup` — utility/layout components

All auth modes render in a single `AuthProvider` component. No caching of previous logins. No passkey support.

## Proposed Changes

### 1. Passkey Auth Support

**New auth mode:** `passkey` alongside `otp`, `oauth`, `password`

**Components:**
- New `AuthPasskey.svelte` — passkey registration and authentication UI
- Update `AuthProvider.svelte` to handle `mode: 'passkey'`

**Adapter contract:** Add optional `AuthAdapter` methods:
```js
/** @property {(options?: any) => Promise<AuthResult>} [registerPasskey] */
/** @property {(options?: any) => Promise<AuthResult>} [authenticatePasskey] */
```

**Dependency:** WebAuthn browser API (`navigator.credentials`). The adapter translates between kavach's interface and the backend's passkey implementation (Supabase, Convex, etc).

### 2. Split Auth Mode Sections

Currently `AuthProvider` renders all modes inline. Redesign to visually separate:
- **Social auth section** — OAuth provider buttons (Google, GitHub, etc.)
- **Password section** — email/password form
- **Magic link section** — email-only OTP form
- **Passkey section** — passkey button

Use horizontal dividers ("or") between sections. Each section is independently hideable.

**New component:** `AuthDivider.svelte` — "or" separator between auth mode sections.

### 3. Cached Login Cards

Cache the last N successful logins in localStorage:
- Provider type (oauth/password/passkey)
- Provider name (google, github, email)
- User avatar URL
- User display name
- Timestamp

**New component:** `AuthCachedLogin.svelte` — renders cached login cards above the main auth form. Clicking a card pre-fills the relevant auth mode.

**Storage:** `localStorage` key `kavach:recent-logins`, max 5 entries, JSON array.

**Privacy:** Only store display info (name, avatar, provider). Never store tokens or passwords.

### 4. Backend as Plugin (Already Done)

The plugin architecture from the current session already separates auth from data. The UI components should consume the kavach instance without caring which adapter is behind it — this is already the case.

No additional work needed here.

## Architecture

```
AuthHandler
├── AuthCachedLogin (new — recent login cards)
├── AuthDivider (new)
├── AuthGroup[social]
│   └── AuthButton × N (OAuth providers)
├── AuthDivider
├── AuthGroup[password]
│   └── AuthPassword (email + password)
├── AuthDivider
├── AuthGroup[magic]
│   └── EmailInput (email only)
├── AuthDivider
└── AuthGroup[passkey] (new)
    └── AuthPasskey (new)
```

## Dependencies

- No new external deps for cached logins (localStorage)
- Passkey: WebAuthn browser API (built-in), no polyfill needed for modern browsers
- Each backend adapter needs to implement passkey methods independently

## Testing

- Unit tests for each new component (snapshot + behavior)
- Unit tests for localStorage caching logic (serialize/deserialize, max entries, expiry)
- Passkey tests with mocked `navigator.credentials` API

## Decision: Keep in @kavach/ui, Upgrade to Svelte 5

Considered moving auth UI to `@rokkit/auth` (or `@rokkit/app`). Decision: **keep in `@kavach/ui`**.

Rationale:
- Avoids cross-repo coordination and release complexity
- Auth icons from `@rokkit/icons` and form primitives from `@rokkit/forms` are already available as dependencies

**Upgrade to Svelte 5** as part of this redesign:
- Migrate from Svelte 4 slots/events to Svelte 5 runes (`$props`, `$derived`, `$state`)
- Follow `@rokkit/app` component patterns (TypeScript, typed props interfaces, composition)
- Use `$props()` destructuring with defaults
- Replace `createEventDispatcher` with callback props (`onchange`, `onsignin`, etc.)

## Open Questions

- Should cached logins expire after a configurable duration?
- Should passkey be a separate adapter method or integrated into signIn with a `mode: 'passkey'` credential?
- Design system: should we provide default styles or rely entirely on consumer CSS?
