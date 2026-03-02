# Auth UI Redesign

**Design:** [docs/design/02-auth-ui.md](../design/02-auth-ui.md)

## Decisions

| Decision | Choice |
|----------|--------|
| Scope | Cached login cards + passkey + smart layout (together) |
| Cache storage | localStorage |
| Cache location | Auth package (kavach instance), UI reads via context |
| Layout | Smart default: cached cards first, expandable "Other options" below |
| Card content | Minimal: avatar, name, provider badge, passkey icon, remove |
| Passkey scope | Design contract now, wire Firebase only this iteration |
| Approach | Incremental — new components alongside existing, no breaking changes |

## Deferred

- Passkey registration UI (future: settings/profile page)
- Passkey wiring for Auth0, Amplify, Supabase, Convex
- Phone/OTP and anonymous auth modes
