# Re-wire `sites/demo` to consume `showcase-kavach`

**Status:** Complete — landed 2026-08-15. Verified: `bun run test:ci` (811
tests), demo + showcase `svelte-check` (0 errors), eslint 0 errors, demo
production build (kit resolved, named tokens emitted).

**Feature:** `docs/features/demo.md` (F1/F2)
**Design:** `docs/design/10-showcase.md` (§5 re-wire follow-up)

### Goal

`/Users/Jerry/Developer/kavach/sites/demo` stops carrying its own copies of the
ported components/state and hardcoded route/label/copy constants, and consumes
the kit (`showcase-kavach`) as a workspace dependency. The demo also gains a
working UnoCSS preset so the kit's named-token vocabulary actually renders
(demo previously had no `uno.config.js`; `presetRokkit` does not emit the
legacy `surface-z*` scale, so demo pages were unstyled).

### What changed

1. **Wiring** — `showcase-kavach: workspace:*` added to demo deps; demo gained
   `uno.config.js` + `rokkit.config.js` (copied from `sites/learn`, presetRokkit
   - icons safelist); stale copies deleted from `sites/demo/src/lib/`
     (DemoNavItem, FloatingBadge, HackerToggle, RoleCard, SentryAnnotation,
     SentryConfigPanel, hacker.svelte.ts).
2. **`(app)/+layout@.svelte`** — imports components + `ADAPTERS`, `ROUTES`,
   `ROUTE_ACCESS`, `RULES`, `COPY` from the kit; hardcoded adapter label map /
   nav copy / route access replaced; `/admin` allowed derived from `role`;
   shell migrated `surface-z*` → named tokens.
3. **`auth/+page.svelte`** — kit `ADAPTERS`/`COPY`/`ROUTES` for label/back-link/
   credentials; kept `@kavach/ui` `AuthProvider`; tokens migrated.
4. **Pages** — `dashboard`, `data`, `admin`, `logout`, `+page.svelte` migrated
   to named tokens; copy pulled from kit `COPY`; `app.html` shell migrated.
5. **Kit typing** — JSDoc types added to `demo-config.js` (`ADAPTERS`,
   `ADAPTER_PROVIDERS`, `isLive`) + `hacker.svelte.ts` `set(val: boolean)`;
   `app.d.ts` ambient for `$app/stores` (+ `@sveltejs/kit` devDep); spec fixes
   (AuthCard props type, DemoNavItem mock page value + click cast) so the kit's
   own `svelte-check` is green too.

### Out of scope (follow-ups)

- Generating `sites/demo/kavach.config.js` from kit `demo-config.js`.
- Re-wiring `sites/learn` to consume the kit.
- Per-adapter site deployments + CI (feature F3/F5).

### Decisions (2026-08-15)

- Full page token migration in scope (required for rendering, not polish).
- Auth page keeps `@kavach/ui` `AuthProvider` (real runtime integration); kit
  `AuthCard` is the mock for showcase/learn.
- `/admin` stays a literal in demo markup (kit `ROUTES` intentionally holds the
  4 nav routes only).
- Demo keeps its own logout page + data endpoint (from v1 decisions).
