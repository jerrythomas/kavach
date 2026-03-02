# CLI Package Design

## Goal

Create a `@kavach/cli` package that scaffolds kavach into existing SvelteKit projects — adding data routes, auth hooks, server endpoints, and login pages with interactive configuration.

## Current State

No CLI exists. The supabase site (`sites/supabase/`) serves as the reference wiring example. Setup is manual: copy route files, configure adapter, wire hooks.

## Proposed Design

### Package

**Name:** `@kavach/cli`
**Binary:** `kavach` (via `npx kavach` or `bunx kavach`)
**Runner:** Node.js (no framework dependency at runtime)

### Commands

```
kavach init          # Interactive setup for new project
kavach add <adapter> # Add a specific backend adapter
kavach update        # Update kavach packages to latest
```

### `kavach init` Flow

1. **Detect project** — verify SvelteKit project (check `svelte.config.js`)
2. **Choose adapter** — prompt: Supabase / Convex / Auth0 / Firebase / Amplify
3. **Configure auth modes** — prompt: password, OAuth providers, magic link, passkey
4. **Configure routes** — prompt: login path (`/auth`), home path (`/`), session endpoint (`/auth/session`)
5. **Generate files:**

| File | Purpose |
|------|---------|
| `src/lib/auth.js` | Kavach instance setup (adapter + options) |
| `src/lib/config.js` | Env var configuration |
| `src/routes/(public)/auth/+page.svelte` | Login page with UI components |
| `src/routes/(public)/auth/+layout.svelte` | Auth layout |
| `src/routes/(app)/+layout.svelte` | Protected layout |
| `src/routes/(server)/data/[...slug]/+server.js` | CRUD data routes |
| `src/routes/(server)/rpc/[...slug]/+server.js` | RPC route |
| `src/hooks.server.js` | Server hook for session handling |
| `.env.example` | Required env vars for chosen adapter |

6. **Install deps** — `bun add` / `npm install` kavach packages + adapter

### `kavach add <adapter>` Flow

For projects that already have kavach but want to add/switch adapters:
1. Install adapter package
2. Update `src/lib/auth.js` with new adapter wiring
3. Update `.env.example` with adapter-specific vars

### Templates

Templates live in `packages/cli/templates/`:
```
templates/
├── auth.js.ejs        # per-adapter auth setup
├── config.js.ejs      # env var config
├── login.svelte.ejs   # login page
├── layout.svelte.ejs  # protected layout
├── hooks.server.js.ejs # server hooks
├── data-route.js.ejs  # CRUD server route
└── rpc-route.js.ejs   # RPC server route
```

Use EJS or simple string interpolation for templates — no heavy templating engine.

### Configuration File

After init, save config to `kavach.config.js` at project root:
```js
export default {
  adapter: 'supabase',
  routes: {
    login: '/auth',
    home: '/',
    session: '/auth/session'
  },
  auth: {
    modes: ['password', 'oauth'],
    providers: ['google', 'github']
  }
}
```

This file is read by `kavach update` to regenerate files without re-prompting.

## Dependencies

- `prompts` or `@clack/prompts` — interactive CLI prompts
- `picocolors` — terminal colors
- No framework runtime dependency

## sv create Plugin

Investigated: `sv` (SvelteKit CLI) supports add-ons via its plugin system. A `kavach` add-on could be registered so `sv add kavach` works. This is a stretch goal — implement the standalone CLI first, then explore `sv` integration.

## Testing

- Unit tests for template rendering (given config → expected file output)
- Integration test: run `kavach init` in a temp SvelteKit project, verify generated files
- Snapshot tests for generated file content

## Open Questions

- Should the CLI support non-SvelteKit frameworks (Next.js, Nuxt) in the future?
- Should generated files include TypeScript variants?
- Should `kavach update` be non-destructive (preserve user modifications)?
