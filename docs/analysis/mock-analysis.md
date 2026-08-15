# Mock Analysis — Kavach Demo & Marketing Site

**Status:** Analysis of the design mock (`docs/mockups/`) vs. the current
implementation (`sites/demo` + `sites/learn`). Input for planning the shared,
multi-adapter demo system.

## 1. Purpose

Kavach's public presence is two things on one domain:

1. **Marketing / learn site** — `kavach.sensei-hq.com` (deployed; built in
   `sites/learn`).
2. **Demo / showcase app** — currently one parameterised app (`sites/demo`)
   that switches adapter via `KAVACH_ADAPTER` env var.

The goal is a **multi-site demo system**: one showcase app per adapter
(`supabase.kavach.sensei-hq.com`, `firebase.kavach.sensei-hq.com`,
`convex.kavach.sensei-hq.com`, …), sharing a **modular component system** and a
**shared config package** so the demos stay consistent and cheap to add.

This doc inventories the mock pages, extracts the design system, maps them onto
the current implementation, and lists the gaps that the demo feature
(`docs/features/demo.md`) must close.

## 2. Source material

| Source                | Location                 | Role                               |
| --------------------- | ------------------------ | ---------------------------------- |
| Design mock (handoff) | `docs/mockups/`          | Single source of visual truth      |
| Marketing site impl   | `sites/learn/`           | Deployed at `kavach.sensei-hq.com` |
| Demo app impl         | `sites/demo/`            | Current parameterised demo         |
| Kavach lib + adapters | `packages/`, `adapters/` | Backend being showcased            |

## 3. The mock — pages (design mocks)

Seven entry `.dc.html` files, each owning its theme shell and composition:

| Page             | File                       | Origin          | What it shows                                                                                                                                                |
| ---------------- | -------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Overview hub     | `Kavach Overview.dc.html`  | `index.jsx`     | Hub linking the Refined landing, the three explorations (A/B/C), the demo, and the quick-start docs. Lists adapters.                                         |
| Refined landing  | `Kavach Landing.dc.html`   | `landing-d.jsx` | **Chosen direction.** Editorial masthead + live CLI hero, Install/Protect/Ship steps, interactive Sentry rules section, "one contract, five adapters" close. |
| A · Terminal     | `Kavach Landing A.dc.html` | `landing-a.jsx` | Terminal-first hero (`TerminalPanel`), FeatureCards, PlatformCards.                                                                                          |
| B · Editorial    | `Kavach Landing B.dc.html` | `landing-b.jsx` | Text-forward editorial layout.                                                                                                                               |
| C · Product      | `Kavach Landing C.dc.html` | `landing-c.jsx` | Product-style landing, uses `AuthCard`.                                                                                                                      |
| Quick-start docs | `Kavach Docs.dc.html`      | `docs.jsx`      | 4-step quick start (`CodeFrame` steps), manual setup, `Callout`s.                                                                                            |
| Demo app         | `Kavach Demo.dc.html`      | `demo.jsx`      | The interactive auth showcase (detailed below).                                                                                                              |

## 4. Design system (from `uno.config.js` + `INVENTORY.md`)

- **Palette** — `bg` `surface` `fill` `line` / text `fg` `ink` `muted` `faint` /
  `accent` + `on-accent`, `action` + `on-action`, `ok` `warn` `danger` (with
  `-tint` / `-ink` pairs), `tok-*` for code tokens.
- **Type** — Overpass (200/300/400/600/800/900) + Open Sans 300 fallback +
  Victor Mono. Scale: `eyebrow caption code ui ui-lg body lede brand title head
display hero`.
- **Rhythm** — `py-section` / `px-gutter` / `p-card` resolve to density vars.
- **Breakpoints** — 640 / 900 / 1120, only via `lt-sm:` `lt-md:` `lt-lg:`.
- **Radii** — `control` 12, `card` 16, `chip` 8, `sm` 4, `pill`.
- **Theme axes** — `[data-theme]` + `[data-density]`. No `dark:` variants.
- **Motion** — 200ms `ease-kv`, opacity + 2px translate only; reduced-motion
  honoured.
- **Artifacts** — `content.js` holds _all_ copy/data (no strings in markup),
  `highlight.js` returns token class names, `kv-icons.js` provides `KvIcon` +
  `KvBrand`. `uno.config.js` is the single token source (runtime via
  `window.__unocss` boot shim).

## 5. Component inventory (mock)

| Component       | Props                                                                         | Used in              |
| --------------- | ----------------------------------------------------------------------------- | -------------------- |
| `Button`        | `label href variant action\|ghost size sm\|md\|lg iconName onClick`           | Stack, A, B, C, Docs |
| `SectionHead`   | `eyebrow title body align size`                                               | Sentry, Stack, C     |
| `CodeFrame`     | `code lang js\|bash label`                                                    | Steps, Sentry, Docs  |
| `Callout`       | `tone warning\|accent text linkLabel linkHref`                                | Docs                 |
| `FeatureCard`   | `icon title body`                                                             | A                    |
| `PlatformCard`  | `platformId title pkg description capabilities live href`                     | A                    |
| `TerminalPanel` | `animate`                                                                     | ShipAuth, A          |
| `AuthCard`      | `showPicker showRolePreview adapterId footnote* onSuccess onPickAdapter`      | C, Demo              |
| `SiteHeader`    | `active label theme onToggleTheme`                                            | all                  |
| `SiteFooter`    | —                                                                             | all                  |
| Sections        | `HeroSection` `ShipAuthSection` `StepsSection` `SentrySection` `StackSection` | Refined, A, B        |

Notably **one `AuthCard`** powers both the C landing and the full Demo app —
the demo is an integration, not a new page set.

## 6. The Demo mock in detail (`Kavach Demo.dc.html`)

Two states driven by an `onSuccess` callback from `AuthCard`:

**Signed out:**

- Centered `AuthCard` with adapter picker (`showPicker`) and role preview
  (`showRolePreview`) — a **user** vs **admin** radio/segmented choice that
  previews which routes stay open.
- Back link to the marketing site.

**Signed in:**

- **Header** — brand, adapter pill (signs out to switch), theme toggle, user
  cluster (avatar initial, email, role label).
- **Sidebar** — nav items: _Dashboard_, _Space Facts_, _Admin Panel_ (the last
  is `admin`-only, shows a lock). Below: "Your access" **role card** — current
  role badge + route list (`/`, `/auth`, `/dashboard`, `/data`, `/admin`) each
  with an `ok`/`danger` dot and strikethrough for blocked routes.
- **Data gating** — the data page shows a facts list; classified facts are
  revealed only for `admin` ("You can see classified facts" vs "General facts
  only"). This demonstrates **role-scoped data access**, not just route access.
- Hacker-mode aesthetic; `SentryConfigPanel` illustrates the active rule set.

The role rules (shared with `content.js` `CONFIG_CODE` / `sentry.rules`):

```
/          public
/auth      public
/dashboard roles: '*'
/data      roles: '*'
/admin     roles: ['admin']
```

## 7. Current implementation — what actually exists

### `sites/demo` (the parameterised demo)

- **Config** — `kavach.config.js` has `ADAPTER_CONFIGS` for `supabase`
  (google + magic-otp), `firebase` (google + magic-otp), `convex` (google);
  adapter selected by `KAVACH_ADAPTER` env. Routes: `auth /data logout /dashboard`.
  Rules match the mock (`/data/facts` for all, `/data/admin-stats` admin-only).
- **Routes** — public `+page` + `/auth`; `(app)` group with `dashboard`,
  `admin`, `data`, `logout`; `(server)` `data/[...slug]` API + sitemap.
- **Components** — `RoleCard`, `DemoNavItem`, `SentryConfigPanel`,
  `SentryAnnotation`, `HackerToggle`, `FloatingBadge`, `hacker.svelte.ts`.
- **Tests** — Playwright (`e2e/demo.e2e.ts`, per-adapter env files +
  `test:e2e:supabase|firebase|convex`).

### `sites/learn` (marketing, deployed)

- Route groups: `(public)` landing + full docs tree; `(demo)/demo` platform
  switcher (`modes.ts` AUTH_MODES, `platforms.ts`); `(mockups)/mockups`
  mirroring demo-a/b, learn-a/b/c.
- Wrangler/Workers static-assets deploy (`kavach` worker → custom domain),
  SvelteKit `adapter-cloudflare`.
- Demo URLs via `PUBLIC_DEMO_SUPABASE/FIREBASE/CONVEX_URL` env (localhost ports
  4173/4174/4175; production → deployed URLs).

## 8. Gap analysis — mock vs implementation

| #   | Mock has                                            | Implementation                                           | Gap                                                                        |
| --- | --------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| G1  | One demo app, adapter-picked live                   | Single app, adapter switched by env at build             | **No per-adapter deployed sites** (`*.kavach.sensei-hq.com`)               |
| G2  | One shared `AuthCard` across landing + demo         | Demo re-uses Svelte components; learn has its own copies | **No shared component package** — duplication across sites                 |
| G3  | All copy in `content.js` (no strings in markup)     | Demo strings live inline in Svelte files                 | Copy not centralised for demos                                             |
| G4  | `PlatformCard` marks `live: true/false` per adapter | `platforms.ts` exists in learn                           | No **live demo link** per adapter                                          |
| G5  | Role-scoped data (classified facts)                 | `/data/admin-stats` API gated                            | Data-level gating demo is minimal (route-level yes, content-level partial) |
| G6  | Adapter pill + picker in AuthCard                   | Adapter chosen by env, not UI                            | **No in-demo adapter switcher** for visitors                               |
| G7  | Theme toggle + density axes                         | learn has toggle; demo (app) unclear                     | Consistent theme control across all demos                                  |
| G8  | Docs quick-start (4 steps + manual)                 | learn docs tree exists                                   | Docs live (not a gap per se) — needs linking from demo                     |
| G9  | Landing A/B/C explorations                          | `(mockups)` group in learn                               | Explorations archived in-place; fine                                       |
| G10 | One `TerminalPanel`/CLI demo                        | Home + docs show CLI copy                                | CLI init demo not interactive in demo app                                  |

**Summary:** the visual system and the core demo app both exist. What's missing
is the _multi-site packaging_ (G1), the _shared component/config layer_ (G2/G3)
that makes multiple adapters cheap to ship, and the _live per-adapter linkage_
(G4/G6) that turns the marketing site into a showcase entry point.

## 9. Implication for the plan

Build a **shared showcase kit** (`sites/showcase` — components + config + copy)
that both the learn site and every per-adapter demo site consume, then deploy
one site per adapter on its own subdomain with the shared kit + adapter-specific
config. Feature requirements and Gherkin scenarios: see `docs/features/demo.md`.
