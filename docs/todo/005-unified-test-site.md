# Unified test site with switchable adapter

Replace the separate supabase and skeleton example sites with a single site that can switch adapters via environment variable.

- Single SvelteKit site covering auth flows + data CRUD + RPC
- Adapter selected via env var (e.g., `PUBLIC_AUTH_ADAPTER=supabase`)
- Playwright e2e tests run the same site with different `.env` files per adapter
- Covers: Supabase, Firebase, Auth0, Amplify, Convex
- Deprecates `sites/supabase` and `sites/skeleton` once complete
- Related: backlog #04 (deprecate supabase example)

Question 1:** How should the adapter be selected at runtime? 

- **A)** Environment variable (e.g., `PUBLIC_AUTH_ADAPTER=supabase`) — simplest, switch by changing `.env
