# @kavach/sentry

Role-based route protection for SvelteKit apps.

## Installation

```bash
bun add @kavach/sentry
```

## Usage

```js
import { createSentry } from '@kavach/sentry'

const sentry = createSentry({
  app: {
    home: '/',
    login: '/auth',
    logout: '/logout',
    session: '/auth/session'
  },
  roles: {
    '*': { routes: ['/dashboard', '/profile'] },
    admin: { home: '/admin', routes: ['/admin', '/data/admin'] }
  }
})

// Update on sign in/out
sentry.setSession(session)

// Check a route
const result = sentry.protect('/dashboard')
// => { status: 200 }
// => { status: 401, redirect: '/auth' }
// => { status: 403, redirect: '/' }
```

## Configuration

### `SentryOptions`

| Option   | Type                        | Description                                                  |
| -------- | --------------------------- | ------------------------------------------------------------ |
| `app`    | `AppRoute`                  | App routes: `home`, `login`, `logout`, `session`             |
| `roles`  | `Record<string, RoleRoute>` | Role-based route rules. Use `'*'` for any authenticated user |
| `logger` | `Logger`                    | Optional `@kavach/logger` instance                           |

### Role configuration

```js
roles: {
  '*': {
    home: '/dashboard',    // optional: override home for authenticated users
    routes: ['/dashboard'] // routes accessible to any authenticated user
  },
  admin: {
    routes: ['/admin']     // routes restricted to the 'admin' role
  }
}
```

All routes are protected by default. Unauthenticated users are redirected to `app.login`. Authenticated users without the required role receive a 403.

## API

### `createSentry(options): Sentry`

Returns a sentry instance:

| Method                       | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `sentry.setSession(session)` | Update the current session (call on auth state change) |
| `sentry.protect(path)`       | Returns `{ status: 200 }` or `{ status, redirect }`    |
| `sentry.app`                 | The resolved `AppRoute` config                         |

Used internally by the `kavach` package — you generally won't use this directly.
