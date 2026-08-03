# @kavach/ui

Svelte UI components for Kavach authentication flows.

## Installation

```bash
bun add @kavach/ui
```

## Setup

Components read the Kavach instance from Svelte context. Set it in a parent layout:

```svelte
<script>
  import { setContext, onMount } from 'svelte'
  import { createKavach } from 'kavach'

  const kavach = $state({})
  setContext('kavach', kavach)

  onMount(async () => {
    const { adapter } = await import('$kavach/auth')
    Object.assign(kavach, createKavach(adapter))
  })
</script>
```

## Components

### `AuthProvider`

Sign-in button or form for a single provider. Supports OAuth, magic link (OTP), and password modes.

```svelte
<script>
  import { AuthProvider } from '@kavach/ui'
  let email = ''
  let password = ''
</script>

<!-- OAuth button -->
<AuthProvider mode="oauth" name="google" label="Continue with Google" />

<!-- Magic link form -->
<AuthProvider mode="otp" name="magic" label="Sign in with Magic Link" bind:value={email} />

<!-- Password form -->
<AuthProvider mode="password" name="email" label="Sign in" bind:value={email} bind:password />
```

**Props:** `mode` (`'oauth'|'otp'|'password'`), `name`, `label`, `scopes`, `value`, `password`, `onerror`, `onsuccess`

### `AuthPage`

Full auth page composed from a list of providers defined in `kavach.config.js`.

### `LoginCard` / `LoginCardList`

Card UI for a single provider or a rendered list of providers.

### `AuthGroup`

Groups multiple `AuthProvider` components.

### `AuthHandler`

Handles post-auth redirects and session state on the client.

### `AuthPassword`

Email + password input pair wired for sign-in.

### `AuthError`

Displays an authentication error message.

### `AuthResponse`

Displays an auth response (info, success, or error state).

## Theming (data-\* attributes)

These components ship no CSS and expose no CSS variables of their own. They render a stable set
of `data-*` attributes that you style from your app's global CSS — target the attribute (and
its value) with `@apply` or plain CSS. The palette/skin/mode layer (`data-skin`, `data-mode`)
comes from rokkit at the app root; nest kavach's attributes under `[data-mode='…']` for
per-mode styling.

| Attribute                               | Rendered on                                         | Value                                                   |
| --------------------------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| `data-auth`                             | `AuthProvider` root, `AuthHandler`                  | —                                                       |
| `data-auth-provider="<name>"`           | `AuthProvider` root + its OAuth/OTP button          | provider name (`google`, `github`, `magic`, `email`, …) |
| `data-auth-mode="oauth\|otp\|password"` | `AuthProvider` root / submit button                 | the mode                                                |
| `data-item-icon` / `data-item-label`    | provider icon / label `<span>`                      | —                                                       |
| `data-auth-page`                        | `AuthPage` root                                     | —                                                       |
| `data-other-options`                    | `AuthPage` cached-logins `<details>`                | —                                                       |
| `data-login-card`                       | `LoginCard` root                                    | —                                                       |
| `data-provider="<name>"`                | `LoginCard` badge                                   | provider name                                           |
| `data-passkey` / `data-remove`          | `LoginCard`                                         | —                                                       |
| `data-error`                            | `AuthError` root                                    | —                                                       |
| `data-alert`                            | `AuthResponse` root (also toggles class `hasError`) | —                                                       |

Also inherited from `@rokkit/ui` (present in the DOM you style): `data-button`, `data-style`
(`"none"` on OAuth buttons), `data-size`, `data-variant`, `data-field`, `data-input-icon`.

Example — brand each provider button and support dark mode (`--provider-*` are variables you
define; kavach exposes none):

```css
[data-auth-provider] [data-item-icon] {
  width: 1.25rem;
  height: 1.25rem;
}
[data-auth-provider] [data-button] {
  width: 100%;
}

[data-auth-provider='github'] {
  --provider-bg: #24292e;
  --provider-text: #fff;
  --provider-border: #24292e;
}
[data-auth-provider='google'] {
  --provider-bg: #fff;
  --provider-text: #3c4043;
  --provider-border: #dadce0;
}

[data-mode='light'] [data-auth] > [data-button][data-style='none'] {
  background: var(--provider-bg);
  color: var(--provider-text);
  border-color: var(--provider-border);
}
[data-mode='dark'] [data-auth-provider] [data-button] {
  background: var(--provider-bg);
  color: var(--provider-text);
  border-color: var(--provider-border);
}
```

A complete working reference lives in `sites/learn/src/app.css`.
