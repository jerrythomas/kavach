# Design

Module-level design documents — the **how** and **why**.

Written for human audience. Each module gets a numbered file describing the design approach, patterns used, and reasoning. Numbered 1:1 with [requirements](../requirements/).

## Modules

| # | Module | Description | Status |
|---|--------|-------------|--------|
| 01 | [Auth](01-auth.md) | Core auth orchestration — createKavach, session cookies, SvelteKit hook | Current |
| 02 | [Route Protection](02-route-protection.md) | Guardian — depth-first matching, role grouping, fail-secure | Current |
| 03 | [Adapters](03-adapters.md) | Adapter plugin pattern, per-provider specs, auth mode routing | Current |
| 04 | [Query](04-query.md) | Filter parsing pipeline, two-tier operators, IR structure | Current |
| 05 | [UI](05-ui.md) | Svelte components — cached logins, smart layout, passkey contract | Current |
| 06 | [Logging](06-logging.md) | Context-scoped logging, writer abstraction, zero-cost filtering | Current |

## Common Patterns & Guidelines

Established patterns used across the project. Check here before implementing to ensure consistency. Update when new reusable patterns emerge.

### Adapter Pattern
**When:** Integrating an external service (auth provider, log output, data backend).
**Pattern:** Define an interface. Consumer creates the SDK client. Adapter wraps it. No global state.
**Used in:** Auth adapters, log writers

### Result Normalization
**When:** Wrapping SDK calls that return different shapes.
**Pattern:** `transformResult()` maps provider responses to `{ data, error }` or `AuthResult`.
**Used in:** All auth adapters

### Context Scoping
**When:** Logging or tracing needs to carry identity through call chains.
**Pattern:** Create scoped child instances via `getContextLogger(context)`. Children inherit + extend parent context. Parent is never mutated.
**Used in:** Logger, auth orchestration

### Zero/No-op Defaults
**When:** A dependency is optional (logger, cache, etc.).
**Pattern:** Provide a no-op implementation (e.g., `zeroLogger`) so consumers don't need null checks.
**Used in:** Logger (zeroLogger), login cache (server no-ops)

## References

| Reference | URL | Notes |
|-----------|-----|-------|
| SvelteKit Hooks | https://svelte.dev/docs/kit/hooks | handle() integration point |
| PostgREST Operators | https://postgrest.org/en/stable/references/api/tables_views.html | Filter syntax inspiration |
| Supabase JS | https://supabase.com/docs/reference/javascript | Reference adapter SDK |

## Conventions

- One file per module: `NNN-<module>.md`
- Numbering aligns 1:1 with requirements (e.g., `01-auth` in both)
- Focus on **how** it's built and **why** those choices were made
- Describe patterns and approaches in prose — code only as illustration
- Update when implementation changes the module's design
