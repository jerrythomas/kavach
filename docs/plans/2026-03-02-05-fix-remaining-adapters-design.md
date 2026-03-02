# Fix Remaining Adapters

**Design:** [docs/design/01-adapters.md](../design/01-adapters.md)

## Summary

Bring Firebase, Auth0, and Amplify adapters to parity with Supabase: plugin architecture, current SDK versions, comprehensive mock-based tests.

## Decisions

- Full refactor all three adapters with comprehensive tests
- Upgrade Firebase to v10 modular, Amplify to v6 modular, Auth0 stays current
- Common auth baseline: password, OAuth, magic link/OTP
- Mock SDK tests only — integration tests deferred
- Sequential execution: Firebase → Auth0 → Amplify
- JavaScript with JSDoc — TS migration as separate backlog item

## Package Changes

| Adapter | Remove | Add |
|---------|--------|-----|
| Firebase | `@firebase/app`, `@firebase/auth` | `firebase` |
| Amplify | (same package) | `aws-amplify` v6 (major bump) |
| Auth0 | (no change) | `@auth0/auth0-spa-js` (keep current) |

## Deferred to Backlog

- Phone OTP and anonymous auth
- Integration tests with real backends
- TypeScript migration
- Adapter capability detection
