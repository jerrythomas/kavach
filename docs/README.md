# Kavach Documentation

Kavach is a drop-in authentication framework for SvelteKit. It provides a unified API across auth providers (Supabase, Firebase, Auth0, Amplify, Convex), declarative route protection, and pre-built UI components.

## Modules

| # | Module | What it does | Docs |
|---|--------|-------------|------|
| 01 | **Auth** | Session management, credential flows, SvelteKit hook | [requirements](requirements/01-auth.md) · [design](design/01-auth.md) |
| 02 | **Route Protection** | RBAC, declarative routing rules, fail-secure | [requirements](requirements/02-route-protection.md) · [design](design/02-route-protection.md) |
| 03 | **Adapters** | Provider integrations, response normalization | [requirements](requirements/03-adapters.md) · [design](design/03-adapters.md) |
| 04 | **Query** | Filter parsing, operator validation, error sanitization | [requirements](requirements/04-query.md) · [design](design/04-query.md) |
| 05 | **UI** | Svelte auth components, cached logins, smart layout | [requirements](requirements/05-ui.md) · [design](design/05-ui.md) |
| 06 | **Logging** | Structured context-scoped logging, pluggable writers | [requirements](requirements/06-logging.md) · [design](design/06-logging.md) |

Requirements cover **what** and **why**. Design covers **how** and **why**. Numbered 1:1 per module.

## Project Tracking

| Resource | Purpose |
|----------|---------|
| [stories/](stories/) | Story specs + [backlog dashboard](stories/README.md) |
| [plans/](plans/) | Active plan + archived completed plans |
