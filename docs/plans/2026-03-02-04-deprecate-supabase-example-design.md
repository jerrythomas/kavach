# Deprecate Supabase Example Site Design

## Goal

Replace the standalone supabase example site with CLI-based setup instructions, making the learn site the single source of truth for examples and documentation.

## Current State

`sites/supabase/` is a full SvelteKit app with:
- Auth pages (login, logout)
- Server routes (data CRUD, RPC)
- Session handling hooks
- Kavach wiring (`src/lib/auth.js`)

It's the reference implementation that the CLI (backlog #02) would generate.

## Proposed Approach

### Phase 1: Extract Reference Patterns

Before deprecating, ensure all patterns from the supabase site are captured:

1. **CLI templates** — `kavach init` generates equivalent files (backlog #02)
2. **Learn site example** — live working demo in the learn site (backlog #03)
3. **Migration guide** — already created (`docs/plans/2026-03-02-plugin-migration-guide.md`)

### Phase 2: Add Deprecation Notice

Add a README.md to `sites/supabase/` explaining:
- This site is deprecated in favor of `kavach init`
- Link to learn site for documentation
- Link to CLI instructions for setting up a new project

### Phase 3: Remove from Active Development

- Remove from CI/CD pipeline (if any)
- Keep the directory for reference but stop maintaining it
- Eventually remove in a future major version

### Dependency: Backlog Items #02 and #03

This item should be executed **after** the CLI package (#02) and learn site (#03) are functional. The supabase example site is the primary reference for both — it can't be deprecated until its patterns are captured elsewhere.

## Execution Order

1. Build CLI package (backlog #02) — templates based on supabase site patterns
2. Update learn site (backlog #03) — include live supabase example
3. Verify CLI generates working projects equivalent to supabase site
4. Add deprecation notice
5. Remove from workspace (optional, future)

## What Replaces It

| Current (supabase site) | Replacement |
|------------------------|-------------|
| Reference wiring code | CLI-generated scaffolding |
| Live example | Learn site demo |
| Route patterns | CLI templates |
| Configuration example | `kavach.config.js` from CLI |

## Open Questions

- Should we keep the skeleton site (`sites/skeleton/`) or deprecate it too?
- When should the supabase site directory actually be deleted vs just deprecated?
