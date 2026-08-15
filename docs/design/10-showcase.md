# Showcase — Shared Component Kit & Config

**Status:** Draft — for review before implementation
**Feature:** `docs/features/demo.md` (F1, F2, F7)

## 1. Goal

A site-scoped workspace `sites/showcase` (package `showcase-kavach`) holding the
**shared components, state, and config** that power every demo site and the
marketing site's demo surfaces. No published npm package — pure workspace
sharing via bun workspaces (`"workspaces": ["sites/**"]` already exists).

## 2. What it exports

### Components (`src/lib/components/`)

| Component           | Props                                                                           | Source                    | Notes                                                  |
| ------------------- | ------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------ |
| `AuthCard`          | `adapterId`, `providers`, `rolePreview`, `onSuccess`, `showPicker`, `footnote*` | **new** (mock `AuthCard`) | Provider list + role preview + optional adapter picker |
| `RoleCard`          | `role`, `routes`                                                                | port from `sites/demo`    | Role badge + route list with ok/danger dots            |
| `DemoNavItem`       | `href`, `label`, `icon`, `locked`                                               | port from `sites/demo`    | Active state + locked + hacker-mode unlock             |
| `SentryConfigPanel` | `rules`                                                                         | port from `sites/demo`    | Rule set readout                                       |
| `SentryAnnotation`  | —                                                                               | port from `sites/demo`    | Small rule annotation                                  |
| `HackerToggle`      | —                                                                               | port from `sites/demo`    | Toggle bound to `hackerMode`                           |
| `FloatingBadge`     | `adapterId`, `adapterLabel`                                                     | port from `sites/demo`    | Adapter pill                                           |

Ports are **copied then adjusted** — the demo kept working while the kit was
proven; `sites/demo` is now re-wired to consume the kit (2026-08-15).
`sites/learn` consumes the kit's config (`ADAPTERS`, demo URLs) and shared
state (`hackerMode`); its `/demo` explainer keeps its own FitTrack simulation
(2026-08-15).

### State (`src/lib/state/hacker.svelte.ts`)

Module-level `$state` singleton `hackerMode` (port from `sites/demo`).

### Config (`src/lib/config/`)

`demo-config.js` — single source for:

- `ADAPTERS` — id → label, package (`@kavach/adapter-*`), capabilities, demo URL.
- `ROUTES` — `auth /data /logout /home`.
- `RULES` — the 7-rule array (`sites/demo/kavach.config.js` derives from it):
  `/`, `/auth` public; `/dashboard`, `/data`, `/data/facts` roles `'*'`;
  `/admin`, `/data/admin-stats` roles `['admin']`. `/logout` is intentionally
  absent — it's an internal action handled by the runtime (`routes.logout`),
  not a protected page.
- `COPY` — demo copy so no strings live in markup (mock's "no strings in
  markup" principle).
- `ADAPTER_ENV` — env keys per adapter (supabase/firebase/convex).

## 3. Styling approach

Components use the **named-token vocabulary** from `docs/mockups` /
`semantic-styles-rokkit` (`bg-paper`, `text-ink`, `text-ink-mute`,
`text-ink-soft`, `border-paper-edge`, `bg-paper-soft`, `bg-primary`,
`text-on-primary`, `bg-success-soft`, `text-success`, `bg-warning-soft`,
`text-warning`, `bg-danger-soft`, `text-danger`). Ports are **converted from the
legacy `surface-z*` scale** as part of the port (decision 2026-08-14) — no
legacy classes ship in the kit. Components accept classes; they don't own
layout.

## 4. Testing

### Vitest (unit/component — jsdom)

- New project in `config/vitest.config.js`: `{ name: 'showcase', root:
'sites/showcase', plugins: [svelte({hot:false}), svelteTesting()] }` (same
  pattern as the `ui` project).
- Tests in `sites/showcase/src/spec/**/*.spec.js`, using
  `@testing-library/svelte` + `@testing-library/jest-dom`.

| Suite               | Covers                                                                      |
| ------------------- | --------------------------------------------------------------------------- |
| `RoleCard`          | user vs admin dots, strikethrough, unauthenticated fallback                 |
| `DemoNavItem`       | active state, locked blocks click in app mode, hacker mode unlocks          |
| `AuthCard`          | provider buttons render, role preview toggles, picker fires `onPickAdapter` |
| `SentryConfigPanel` | renders each rule path + role label                                         |
| `hacker` state      | toggle/set semantics                                                        |
| `demo-config`       | rules match feature spec; every route referenced                            |

### Playwright (e2e)

- **The demo's existing e2e suite moves into the kit** — `sites/showcase/e2e/`
  holds both the tests and the helpers (fixtures, per-adapter logins, global
  setup, per-adapter env). `sites/demo` and `sites/learn` then import the kit's
  helpers rather than duplicating them. The suite runs against the built demo
  site (supabase on :4173 by default; `KAVACH_ADAPTER` selects firebase/convex).
- Assertions mirror F4 Gherkin: unauth → `/auth` redirect, user blocked from
  `/admin`, admin sees classified facts.

## 5. Repo wiring

- `config/vitest.config.js` — add `showcase` project.
- `sites/showcase/package.json` — `name: "showcase-kavach"`, scripts:
  `dev/build/check/lint/format/test:unit/test:e2e`.
- Exports via `src/index.js` (barrel) — `{ AuthCard, RoleCard, DemoNavItem, …
demoConfig, hackerMode }`.
- eslint: `sites/showcase` falls under root config (learn/demo have local
  ignores; check whether showcase needs an entry).
- `sites/demo/e2e/` emptied after the move; `sites/demo` now consumes the kit
  (components, state, `demo-config`) and gains `uno.config.js` +
  `rokkit.config.js` so named tokens render. `sites/learn` consumes the kit's
  config + shared hacker state (2026-08-15).

## 6. Open design choices (settled)

1. **Token migration** — ports convert `surface-z*` → named tokens now
   (decision 2026-08-14).
2. **AuthCard scope** — keep `showPicker` behind a flag (no runtime switcher
   per decision); picker not rendered in per-adapter sites.
3. **E2E placement** — demo e2e tests move into `sites/showcase/e2e/`; both
   demo and learn import kit helpers (decision 2026-08-14).
