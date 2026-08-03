# @kavach/cli

CLI tool for setting up Kavach authentication in SvelteKit projects.

## Installation

```bash
bun add -d @kavach/cli
```

## Commands

### `kavach init`

Interactively initialize Kavach in a SvelteKit project. The wizard:

1. Detects your package manager and TypeScript setup
2. Prompts you to select an auth adapter (Supabase, Firebase, Auth0, Amplify, or Convex)
3. Configures auth providers (Google, GitHub, magic link, password, etc.)
4. Sets up routes for auth, data, and logout
5. Patches `vite.config.js`, `hooks.server.js`, and `+layout.server.js`
6. Generates an auth page and any data/RPC routes
7. Installs required dependencies and updates `.env`

```bash
npx kavach init
# or
bunx kavach init
```

### `kavach add`

Add individual components to an existing Kavach setup:

```bash
kavach add auth-page   # Add an auth page
kavach add routes      # Add route configuration
```

### `kavach skills`

Install Kavach's AI skills into a project's `.claude/skills/` so coding agents know how to use
the toolkit (config, providers, scopes, paths, route rules, data endpoints) instead of
hand-rolling auth.

```bash
kavach skills list                 # show the catalog, marking installed ones
kavach skills add kavach-setup     # install one or more by name
kavach skills add --all            # install the whole catalog
kavach skills add                  # pick interactively
```

Available skills: `kavach-setup`, `kavach-providers`, `kavach-authorization`,
`kavach-data-access`.

### `kavach agents`

Install Kavach's review agents into `.claude/agents/`. They review a consuming app's Kavach
integration and route protection, then verify with a build and real auth flows.

```bash
kavach agents list                            # show the catalog
kavach agents add kavach-integration-reviewer # install by name
kavach agents add --all                       # install all
kavach agents add --all --remote              # pull from the site instead of the bundled copy
```

Available agents: `kavach-integration-reviewer`, `kavach-authorization-reviewer`.

The catalog is also published as a manifest at the repo root (`sensei.library.json`) for
external tooling to ingest.

## Requirements

Must be run from a SvelteKit project root (requires `svelte.config.js`).
