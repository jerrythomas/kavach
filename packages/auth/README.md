# kavach

> Kavach — Protective Armour. Drop-in security for SvelteKit apps.

## Installation

```bash
bun add kavach @kavach/adapter-supabase
# pick the adapter for your backend
```

## Quick start

```bash
bun add kavach @kavach/vite @kavach/adapter-supabase
# pick the adapter for your backend
```

Create `kavach.config.js` in your project root:

```js
export default {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { name: 'magic', mode: 'otp', label: 'Magic Link' }
  ],
  rules: [
    { path: '/', public: true },
    { path: '/auth', public: true },
    { path: '/dashboard', protected: true }
  ],
  env: {
    url: 'PUBLIC_SUPABASE_URL',
    anonKey: 'PUBLIC_SUPABASE_ANON_KEY'
  }
}
```

Add the Kavach plugin to `vite.config.js` — it must come before `sveltekit()`:

```js
import { kavach } from '@kavach/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [kavach(), sveltekit()]
})
```

Register the server hook in `src/hooks.server.js`:

```js
import { kavach } from '$kavach/auth'
export const handle = kavach.handle
```

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { setContext, onMount } from 'svelte'
  import { page } from '$app/stores'

  const kavach = $state({})
  setContext('kavach', kavach)

  onMount(async () => {
    const { createKavach } = await import('kavach')
    const { adapter, logger } = await import('$kavach/auth')
    const { invalidateAll } = await import('$app/navigation')
    const instance = createKavach(adapter, { logger, invalidateAll })
    Object.assign(kavach, instance)
    instance.onAuthChange($page.url)
  })
</script>
```

## What it does

- **Route protection** — all routes are private by default; define public and role-scoped routes in `kavach.config.js`
- **Session management** — reads and writes session cookies on the server, syncs to the client
- **Auth adapter** — delegates sign in, sign out, and token refresh to the backend of your choice
- **Logging** — structured JSON logging via `@kavach/logger`

## Configuration

Use `kavach init` to scaffold configuration, or create `kavach.config.js` manually:

```js
export default {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { mode: 'otp', name: 'magic', label: 'Email Magic Link' }
  ],
  routes: {
    auth: '(public)/auth',
    logout: '/logout'
  },
  roles: {
    '*': { routes: ['/dashboard'] },
    admin: { routes: ['/admin'] }
  }
}
```

## Adapters

| Package                    | Backend               |
| -------------------------- | --------------------- |
| `@kavach/adapter-supabase` | Supabase              |
| `@kavach/adapter-firebase` | Firebase Auth         |
| `@kavach/adapter-auth0`    | Auth0                 |
| `@kavach/adapter-amplify`  | AWS Amplify / Cognito |
| `@kavach/adapter-convex`   | Convex                |

## API

### `createKavach(adapter, options?)`

Returns a Kavach instance with:

- `handle` — SvelteKit server hook
- `signIn(credentials)` — sign in with the configured adapter
- `signOut()` — sign out and clear session
- `onAuthChange(url)` — handle OAuth callback URLs
- `user` — current user (reactive on client)
- `session` — current session
