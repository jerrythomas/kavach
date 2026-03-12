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
