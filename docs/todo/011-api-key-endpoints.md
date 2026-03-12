# 011 — API Key Based Endpoints

## Summary

Extend kavach's guardian to support API-key-authenticated routes alongside the existing user-session-authenticated routes. This enables developers to protect machine-to-machine endpoints with static API keys while keeping user-facing pages and data endpoints on the existing session-cookie auth flow.

---

## Motivation

Not all traffic to a SvelteKit app comes from browser sessions. Background jobs, webhooks, and third-party integrations need their own authentication mechanism. The guardian currently only understands user roles and public/protected distinctions. API key support rounds out the route-protection model for server-to-server use cases.

---

## Goals

1. Allow route rules to declare a `key` property, marking them as API-key-authenticated.
2. Validate the incoming `x-api-key` header (or configurable header name) against the configured key for that route prefix.
3. Return `401` for missing keys and `403` for wrong keys on API-key routes.
4. Enforce separation: a route prefix cannot be both user-auth and API-key-authenticated (throw a config error if mixed).
5. Expose the validated key identity (e.g. key name/label) in `event.locals` for downstream use.

---

## Proposed Config Shape

```js
// kavach.config.js
export default {
  adapter: 'supabase',
  routes: { auth: '/auth' },
  rules: [
    { path: '/', public: true },
    { path: '/auth', public: true },
    { path: '/demo', roles: '*' },
    // API-key authenticated routes
    { path: '/api/webhooks', key: 'WEBHOOK_API_KEY' },
    { path: '/api/internal', key: 'INTERNAL_API_KEY' }
  ]
}
```

The `key` value is an environment variable name. The actual secret is read server-side from `process.env` at request time, never surfaced to the client.

---

## Non-goals

- Per-endpoint key rotation or key management UI.
- Multiple keys per route (single key per prefix for now).
- API key scopes or permissions beyond route-level access.

---

## Future Direction

- Support an array of valid keys per route for key rotation without downtime.
- Key expiry metadata.
- Audit logging of API key usage via `@kavach/logger`.

---

## Priority

**Future / Low** — useful but not blocking any current milestone.
