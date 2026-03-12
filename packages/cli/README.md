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

## Requirements

Must be run from a SvelteKit project root (requires `svelte.config.js`).
