# Requirements

Module-level requirements — the **what** and **why**.

Written for human audience. Each module gets a numbered file describing what the module does, why it exists, and what problems it solves. No implementation details.

## Modules

| # | Module | Description | Status |
|---|--------|-------------|--------|
| 01 | [Auth](01-auth.md) | Core authentication framework — session management, credential flows, SvelteKit hooks | Current |
| 02 | [Route Protection](02-route-protection.md) | Guardian — RBAC, declarative routing rules, fail-secure defaults | Current |
| 03 | [Adapters](03-adapters.md) | Auth provider adapters — Supabase, Firebase, Auth0, Amplify, Convex | Current |
| 04 | [Query](04-query.md) | Query filter parsing — PostgREST-style operators, ordering, pagination | Current |
| 05 | [UI](05-ui.md) | Svelte auth components — login forms, cached logins, provider groups | Current |
| 06 | [Logging](06-logging.md) | Structured context-aware logging — browser/server, pluggable writers | Current |

## Conventions

- One file per module: `NNN-<module>.md`
- Numbering aligns 1:1 with design docs (e.g., `01-auth` in both requirements/ and design/)
- Focus on **what** the module does and **why** it exists
- No code, no implementation details
- Update when stories change module scope
