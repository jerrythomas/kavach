# 012 — Per-Route Fallback Configuration

## Summary

Allow each route protection rule to declare a custom `fallback` URL for unauthorized access, instead of always redirecting to the global auth route. This makes the guardian's redirect behavior explicit and configurable per rule.

---

## Motivation

Currently the guardian has two redirect targets:

- Unauthenticated users → `routes.auth` (e.g. `/auth`)
- Authenticated users without the required role → also `routes.auth` (or silently allowed)

This is too blunt. An admin-only page should redirect unauthorized authenticated users to a "403 Forbidden" page (or home), not back to the login page they're already past. A missing resource should go to a 404 page. Developers need control over this per-rule.

---

## Goals

1. Add an optional `fallback` field to route rules.
2. When a user fails the rule's access check, redirect to `fallback` if set, otherwise use the global default.
3. Support both page paths (redirect) and HTTP status codes (return error response) as fallback values.
4. Keep backwards compatibility — rules without `fallback` behave exactly as today.

---

## Proposed Config Shape

```js
export default {
  adapter: 'supabase',
  routes: { auth: '/auth' },
  rules: [
    { path: '/', public: true },
    { path: '/auth', public: true },
    // Unauthenticated → /auth (default); authenticated without role → /forbidden
    { path: '/admin', roles: ['admin'], fallback: '/forbidden' },
    // Any access violation → 403 response (no redirect)
    { path: '/api/data', roles: '*', fallback: 403 }
  ]
}
```

---

## Acceptance Criteria

- Unauthenticated user accessing `/admin` → redirect to `/auth` (default, no fallback for unauthenticated case)
- Authenticated user without `admin` role accessing `/admin` → redirect to `/forbidden`
- Authenticated user without session accessing `/api/data` → 403 response
- Rules without `fallback` → unchanged behaviour
- Guardian unit tests cover the fallback routing logic
- `validateConfig` rejects non-string/non-number fallback values

---

## Non-goals

- Per-method fallbacks (GET vs POST).
- Dynamic fallback via callback function (keep config declarative).

---

## Priority

**MVP / Medium** — improves developer experience and is demonstrable in the learn site demo.
