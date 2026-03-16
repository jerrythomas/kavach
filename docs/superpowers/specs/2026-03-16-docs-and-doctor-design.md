# Design: Docs Overhaul + kavach doctor

**Date:** 2026-03-16
**Status:** Approved

## Problem

Two related failures observed when integrating kavach into sensei/apps/dashboard:

1. Developer hand-crafted `kavach.config.js`, `vite.config.ts` patches, and `hooks.server.ts` instead of using `kavach init` — producing an incomplete, machine-specific, broken integration.
2. Documentation does not prevent this: LLM docs have no agent directives against hand-crafting, website docs are thin, CLI is buried, no verification tooling exists.

---

## Part 1: `kavach doctor [--fix]`

New top-level CLI command. Validates an existing kavach integration and optionally repairs auto-fixable issues.

### Checks

| #   | Check                                                                                           | Auto-fixable                             |
| --- | ----------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1   | `kavach.config.js` exists with `adapter`, `env`, `rules` fields                                 | No — run `kavach init`                   |
| 2   | `vite.config.js` imports `kavach` from `@kavach/vite` and lists `kavach()` before `sveltekit()` | Yes — re-run vite patcher                |
| 3   | `hooks.server.js/ts` imports from `$kavach/auth` and exports `kavach.handle`                    | Yes — re-run hooks patcher               |
| 4   | `+layout.server.js/ts` passes `session: locals.session`                                         | Yes — re-run layout patcher              |
| 5   | All `env` keys from `kavach.config.js` exist in `.env`                                          | Yes — add missing keys (empty)           |
| 6   | `.env` values for all kavach keys are non-empty                                                 | No — print `set KEY=<value>` instruction |
| 7   | Adapter package and core kavach packages in `package.json`                                      | Yes — install missing deps               |

### Output format

```
kavach doctor

  ✓ kavach.config.js — valid
  ✗ vite.config.js — kavach() plugin missing
  ✗ hooks.server.ts — imports from 'kavach' directly, should use '$kavach/auth'
  ✓ +layout.server.ts — session passed
  ✗ .env — PUBLIC_SUPABASE_URL is empty
  ✓ dependencies — all installed

  3 issues found. Run kavach doctor --fix to repair what can be fixed automatically.
```

```
kavach doctor --fix

  ✓ kavach.config.js — valid
  ✔ vite.config.js — patched
  ✔ hooks.server.ts — patched
  ✓ +layout.server.ts — session passed
  ✗ .env — set PUBLIC_SUPABASE_URL=<your-value> (cannot be set automatically)
  ✓ dependencies — all installed

  1 issue requires manual action — see above.
```

### Implementation

New file: `packages/cli/src/commands/doctor.js` — `DoctorCommand` class, mirrors `InitCommand` pattern.

Checks use existing patchers and validators from `patchers.js` and `validation.js`.
`--fix` re-runs the relevant patcher for each failed auto-fixable check.

Register in `packages/cli/src/index.js`:

```js
else if (command === 'doctor') await doctor(args.includes('--fix'))
```

---

## Part 2: Documentation Site Overhaul

### Navigation restructure

**Before:** "Getting Started" group (Introduction, Quick Start, Configuration), CLI buried in "Plugins & Tools".

**After:**

```
[flat]  Why Kavach      ← new page
[flat]  Quick Start     ← rewrite, CLI-first
[flat]  CLI             ← rewrite, large page
[flat]  Core Concepts   ← new page, merges auth + authz + session

[group] Adapters
          Supabase, Firebase, Auth0, Amplify, Convex

[group] Reference
          Configuration, Vite Plugin, Sentry, Logger
```

Pages retired: `/docs` (index), `/docs/authentication`, `/docs/authorization`, `/docs/session` — content merged into new pages.

### TableOfContents component

Copy `TableOfContents.svelte` from `rokkit/site/src/lib/components/` into `sites/learn/src/lib/`.

**Temporary:** Once `TableOfContents` is exported from `@rokkit/app`, remove the local copy and import from the package instead.

Update `docs/+layout.svelte`:

- Add `id="main-content"` to the `<main>` element
- Add right `<aside class="hidden xl:flex ...">` with `<TableOfContents />`
- Pattern mirrors rokkit site layout exactly

### Page content specifications

#### Why Kavach (`/docs/why-kavach`)

- What problem kavach solves (scattered auth checks, adapter lock-in)
- The adapter model — one config, swap backends
- Architecture overview: `kavach.config.js` → vite plugin → `$kavach/auth` virtual module → `kavach.handle` hook → sentry → session cookie → `locals.session`
- Key packages and what each does (table)

#### Quick Start (`/docs/quick-start`)

Primary path is CLI only. Manual setup moved to collapsed "Advanced" section at bottom.

Steps:

1. `npx kavach init` (with what it prompts and generates)
2. Fill in `.env` values
3. `npx kavach doctor` to verify
4. Add `<AuthPage />` component

#### CLI (`/docs/cli`)

Large single page with sections:

- Overview + "always use CLI" rule
- `kavach init` — prompts listed, files generated/patched
- `kavach doctor` — all 7 checks, `--fix` behaviour, manual-only items
- `kavach add` — auth-page, routes
- Anti-patterns (with one-line reason each)
- Verifying your setup

Anti-patterns:

```
✗ import kavach from 'kavach'           — no default export
✗ import { createKavach } from 'kavach' — don't call directly in hooks.server
✗ resolve.alias: { kavach: '...' }      — do not alias the package
✗ ssr.noExternal: ['kavach']            — not needed, $kavach/auth handles this
✗ hand-writing kavach.config.js         — run kavach init
```

#### Core Concepts (`/docs/core-concepts`)

Single long page covering:

- Authentication (sign in flows, client-side setup in layout.svelte, signIn/signOut API)
- Authorization (route rules, prefix matching, role-based access, roleHome)
- Session (full chain: hook → cookie → `locals.session` → `layout.server.ts` → `+page.ts load` → component)

#### Adapter pages (all 5)

Each gets:

- Capabilities table
- `kavach.config.js` snippet
- Environment variable table (name, description, where to find it)
- OAuth callback URL setup (where applicable)
- Common errors for that adapter

#### Reference pages (Configuration, Vite Plugin, Sentry, Logger)

Each gets:

- Full typed reference table (field, type, required, default, description)
- Troubleshooting section

### LLM docs overhaul

#### `llms.txt` (index)

Add agent directive block at top:

```
## IMPORTANT — For AI Agents

Never hand-write kavach.config.js, vite.config.js patches, or hooks.server.js.
Always use the CLI:

    npx kavach init          # first-time setup
    npx kavach doctor        # verify existing setup
    npx kavach doctor --fix  # auto-repair issues

Hand-crafting these files causes broken integrations. The CLI handles all patching correctly.
```

Update quick start to reference `kavach init` not manual steps.

#### `auth.txt`

- Add CLI directive at top (never import directly in hooks.server)
- Add anti-patterns section
- Add end-to-end flow description
- Add troubleshooting section
- Fix install to include adapter as required

#### `cli.txt`

- Add `kavach doctor` with full check list and `--fix` behaviour
- Add anti-patterns section
- Add "Verify your setup" section

#### Adapter txt files (all 5)

- Add capabilities table
- Add env var table
- Add common errors section

---

## Scope — First Batch

Implementation proceeds in two batches:

**Batch 1 (this plan):**

- `kavach doctor` CLI command
- `TableOfContents` component copy
- Layout update (TOC sidebar)
- Navigation restructure
- New pages: Why Kavach, Core Concepts
- Rewrites: Quick Start, CLI
- LLM docs: llms.txt, auth.txt, cli.txt

**Batch 2 (follow-up):**

- All 5 adapter pages (website + llms)
- Reference pages with typed tables (Configuration, Vite Plugin, Sentry, Logger)
- Retire old pages (authentication, authorization, session)

---

## Files Changed — Batch 1

### New files

- `packages/cli/src/commands/doctor.js`
- `sites/learn/src/lib/TableOfContents.svelte`
- `sites/learn/src/routes/(public)/docs/why-kavach/+page.svelte`
- `sites/learn/src/routes/(public)/docs/core-concepts/+page.svelte`

### Modified files

- `packages/cli/src/index.js` — register doctor command
- `sites/learn/src/routes/(public)/docs/+layout.svelte` — TOC sidebar, updated nav
- `sites/learn/src/routes/(public)/docs/quick-start/+page.svelte` — CLI-first rewrite
- `sites/learn/src/routes/(public)/docs/cli/+page.svelte` — full rewrite
- `sites/learn/static/llms/llms.txt`
- `sites/learn/static/llms/auth.txt`
- `sites/learn/static/llms/cli.txt`
