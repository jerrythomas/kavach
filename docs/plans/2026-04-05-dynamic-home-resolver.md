# Plan Archive: Dynamic Home URL Resolution

**Date:** 2026-04-05
**GitHub:** #17
**Branch:** develop

## Summary

Added support for `routes.home` to be an async function in `kavach.config.js`, allowing per-user slug-based post-login redirects without a server round-trip.

## Approach

- `processAppRoutes` in `@kavach/sentry` normalises `home` to always be a function. A string value is wrapped in `() => staticHome` with a `._path` annotation so route rule generation still works.
- `@kavach/vite`'s `serialize()` handles functions via `.toString()`, so function values survive the Vite virtual module generation step.
- `handleUnauthorizedAccess` in `@kavach/auth` is now async and calls `await app.home(session)` whenever a redirect to home is needed. Errors fall back to `'/'`.

## Files changed

- `packages/vite/src/generate.js` — function serialization via `.toString()`
- `packages/vite/src/config.js` — `routes.home` passes through as-is (string or function)
- `packages/sentry/src/processor.js` — normalize home to function with `._path`; extract path in rule generation
- `packages/sentry/src/types.js` — typedef updated
- `packages/auth/src/kavach.js` — `resolveHome`, async `handleUnauthorizedAccess`, async `handleRouteProtection`
- `packages/sentry/spec/sentry.spec.js` — updated assertions
- `packages/sentry/spec/processor.spec.js` — updated + new test
- `packages/vite/spec/generate.spec.js` — new function serialization test
- `packages/auth/spec/kavach-server.spec.js` — new dynamic home tests
- `docs/features/02-Authorization.md` — new feature section
- `docs/features/README.md` — feature added to dashboard
