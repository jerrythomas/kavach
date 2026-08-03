# @kavach/sentry

Role-based route protection for SvelteKit apps. Evaluates a flat array of route rules against
the current session and returns an allow / redirect / status decision. Used automatically by
`kavach.handle`; also usable standalone.

## Installation

```bash
bun add @kavach/sentry
```

## Usage

```js
import { createSentry } from '@kavach/sentry'

const sentry = createSentry({
  rules: [
    { path: '/', public: true },
    { path: '/dashboard', roles: '*' }, // any authenticated user
    { path: '/admin', roles: ['admin'] } // only the 'admin' role
  ],
  app: {
    home: '/', // post-login landing — string OR async (session) => path
    login: '/auth', // 401 redirects go here
    logout: '/logout',
    unauthorized: null // 403 target; falls back to `home` when null
  }
})

// Update on sign in/out
sentry.setSession(session)

// Check a route
const result = sentry.protect('/dashboard')
// => { status: 200 }                        — allowed
// => { status: 401, redirect: '/auth' }     — not authenticated
// => { status: 403, redirect: '/' }         — wrong role (→ app.unauthorized ?? app.home)
```

## Configuration

### `SentryOptions`

| Option   | Type            | Description                                                                                  |
| -------- | --------------- | -------------------------------------------------------------------------------------------- |
| `rules`  | `RoutingRule[]` | Prefix-matched route rules, evaluated deepest-path first                                     |
| `app`    | `AppRoute`      | App routes: `home`, `login`, `logout`, `session`, `unauthorized`, `endpoints`, `data`, `rpc` |
| `logger` | `Logger`        | Optional `@kavach/logger` instance                                                           |
| `rpc`    | `Function`      | Optional RPC handler                                                                         |

### `RoutingRule`

```js
rules: [
  { path: '/', public: true }, // open — no session needed
  { path: '/account', roles: '*' }, // any authenticated user (roles defaults to '*')
  { path: '/admin', roles: ['admin'] }, // one of the listed roles
  { path: '/beta', roles: ['tester'], fallback: '/waitlist' }, // per-route redirect override
  { path: '/secret', roles: ['admin'], fallback: 404 } // per-route status override
]
```

| Field      | Default | Meaning                                                                     |
| ---------- | ------- | --------------------------------------------------------------------------- |
| `path`     | —       | Route prefix. Matches the path and everything under `path/`.                |
| `public`   | `false` | `true` → open to everyone.                                                  |
| `roles`    | `'*'`   | Allowed role(s): a string, `string[]`, or `'*'` for any authenticated user. |
| `fallback` | —       | On denial: a **number** overrides the status; a **string** redirects there. |

A rule that isn't `public` is protected; the role is read from `session.user.role`. Protection
is the default — you don't need a `protected` flag (and one isn't read).

### Per-role landing

There is no `roleHome` map. Per-role landing is expressed by making `app.home` a function:

```js
app: {
  home: async (session) => (session.user.role === 'admin' ? '/admin' : '/dashboard')
}
```

A string value is wrapped internally so `await app.home(session)` always works. If the resolver
throws, it falls back to `'/'`.

### Redirect targets on denial

| Situation                              | Status      | Redirect target                   |
| -------------------------------------- | ----------- | --------------------------------- |
| No session                             | `401`       | `app.login`                       |
| Has session, wrong role                | `403`       | `app.unauthorized ?? app.home`    |
| Signed in, visiting the login page     | `302`       | `app.home` (resolved per session) |
| Endpoint route (under `app.endpoints`) | `401`/`403` | _(status only — no redirect)_     |

A matched rule's `fallback` overrides these for that route.

## API

### `createSentry(options): Sentry`

| Method                       | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `sentry.setSession(session)` | Update the current session (call on auth state change) |
| `sentry.protect(path)`       | Returns `{ status: 200 }` or `{ status, redirect }`    |
| `sentry.app`                 | The resolved `AppRoute` config                         |

Used internally by the `kavach` package via `kavach.handle` — you generally won't call this
directly unless you want standalone route protection.
