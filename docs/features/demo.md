# Demo — Showcase App (multi-adapter)

**Module:** Demo / Showcase
**Status:** 🔵 Specified (not yet implemented)

## Decisions (settled 2026-08-14)

| Question            | Decision                                                          |
| ------------------- | ----------------------------------------------------------------- |
| Shared kit location | `sites/showcase` (site-scoped workspace, not published)           |
| Adapter switching   | **Per-subdomain only** — no in-browser runtime switcher           |
| Deploy target       | One Cloudflare Workers project **per adapter**, own custom domain |
| Rollout order       | Supabase → Firebase → Convex (Auth0/Amplify get placeholders)     |

## What

A multi-site showcase proving "adapter + Kavach + SvelteKit = secure auth app
in minutes". One deployed demo site **per adapter**, all built from a **shared
component kit + shared config package**, with the marketing site
(`kavach.sensei-hq.com`) linking to every live demo.

Planned site matrix (subdomains of `sensei-hq.com`):

| Site     | Adapter                    | Demo URL                                   |
| -------- | -------------------------- | ------------------------------------------ |
| Supabase | `@kavach/adapter-supabase` | `supabase.kavach.sensei-hq.com`            |
| Firebase | `@kavach/adapter-firebase` | `firebase.kavach.sensei-hq.com`            |
| Convex   | `@kavach/adapter-convex`   | `convex.kavach.sensei-hq.com`              |
| Auth0    | `@kavach/adapter-auth0`    | `auth0.kavach.sensei-hq.com` (when live)   |
| Amplify  | `@kavach/adapter-amplify`  | `amplify.kavach.sensei-hq.com` (when live) |

## Why

- The current `sites/demo` switches adapters via `KAVACH_ADAPTER` env — a
  visitor only ever sees **one** adapter and cannot compare.
- `PlatformCard` in the mock marks adapters `live: true/false` but nothing links
  to a running instance of each.
- A **shared kit** (components + config + copy) is the only way to keep N demo
  sites cheap to ship and visually consistent with the marketing site.

## Non-goals (out of scope for this feature)

- Implementing adapter packages themselves (they live in `adapters/`).
- The marketing-site content pages (already live in `sites/learn`).

---

## F1 — Shared component kit (`sites/showcase`)

A site-scoped workspace under `sites/` exporting reusable Svelte components
that both `sites/learn` and every demo site import, replacing duplicated local
components (`DemoNavItem`, `RoleCard`, `AuthCard` copies, etc.). **Not**
published to npm — it is showcase code, not a shipped product.

**Gherkin:**

```gherkin
Feature: Shared component kit
  A single importable kit renders every demo surface identically.

  Scenario: Landing and demo render the same AuthCard
    Given the shared kit is installed in a demo site and the marketing site
    When the demo site renders AuthCard with adapterId "supabase"
    And the marketing site renders AuthCard with adapterId "supabase"
    Then both render a card with identical classes, role preview, and provider
      list (google, magic)

  Scenario: RoleCard reflects the route rule set from shared config
    Given a signed-in user with role "admin" on any demo site
    When RoleCard renders the route list from the shared config
    Then /dashboard and /data show "ok" dots
    And /admin shows an "ok" dot for admin
    And a user with role "user" sees /admin struck through with a "danger" dot

  Scenario: Adapter pill signs out and offers to switch
    Given a signed-in user on supabase.kavach.sensei-hq.com
    When they click the adapter pill
    Then they are signed out and shown the auth screen with an adapter picker
```

---

## F2 — Shared config package (`sites/showcase` config)

Centralises the demo's `kavach.config.js` (routes, rules, providers, logging)
and copy inside `sites/showcase`, so the mock's "no strings in markup"
principle is honoured and all demos stay in lockstep. Consumers import the
shared rules/copy and layer adapter-specific env on top.

**Gherkin:**

```gherkin
Feature: Shared demo config
  The rule set and copy live in one package consumed by every site.

  Scenario: Every demo site ships the same protected routes
    Given a fresh build of any adapter demo site
    Then /auth is public
    And /dashboard is public for every signed-in role
    And /data is public for every signed-in role
    And /admin is reachable only by role "admin"

  Scenario: Adapter config varies, rules do not
    Given the shared config package
    When a demo site is built for supabase, firebase, and convex
    Then the routes and rules objects are identical
    And only the adapter-specific env/providers differ

  Scenario: Copy changes once and appears everywhere
    Given copy is stored in the shared config package
    When a string is edited in the package
    Then every demo site and the marketing site reflect the change on rebuild
```

---

## F3 — Per-adapter demo sites (deploy one per adapter)

Each adapter gets its own deployed SvelteKit site on its own subdomain, using
the shared kit + config with that adapter's env values. Each site is a separate
Cloudflare Workers project (worker name `kavach-supabase`, `kavach-firebase`,
`kavach-convex`) replicating the learn site's `wrangler.jsonc` static-assets
setup, bound to its own custom domain (`supabase.kavach.sensei-hq.com`, …).
No runtime adapter switching — each site is standalone.

**Gherkin:**

```gherkin
Feature: Per-adapter demo sites
  A working, deployed, sign-in-capable demo per adapter.

  Scenario: Supabase demo sign-in works end to end
    Given supabase.kavach.sensei-hq.com is deployed with the supabase config
    When an unauthenticated visitor opens the site
    Then they are redirected to /auth
    When they sign in with a valid Google account
    Then they land on /dashboard and are signed in

  Scenario: Firebase demo sign-in works end to end
    Given firebase.kavach.sensei-hq.com is deployed with the firebase config
    When a visitor signs in with the magic link (OTP)
    Then they are signed in and can access /dashboard

  Scenario: Convex demo sign-in works end to end
    Given convex.kavach.sensei-hq.com is deployed with the convex config
    When a visitor signs in with Google
    Then role "user" can open /data but not /admin

  Scenario: Not-yet-live adapters show a friendly placeholder
    Given auth0.kavach.sensei-hq.com has no live adapter credentials
    When a visitor opens it
    Then they see a "coming soon / not configured" state rather than an error
```

---

## F4 — Role-based access showcase

The demo demonstrates **route-level** protection (Sentry rules) and
**content-level** gating (classified data for admin), matching the mock's
"Space Facts" data page.

**Gherkin:**

```gherkin
Feature: Role-based access demo
  Visitors can experience the difference between roles on live data.

  Scenario: User role sees general facts only
    Given a signed-in user with role "user" on any demo site
    When they open /data
    Then they see general space facts
    And they do not see classified facts
    And the RoleCard shows /admin struck through

  Scenario: Admin role sees classified facts
    Given a signed-in user with role "admin"
    When they open /data
    Then they see classified space facts in addition to general ones
    And they can open /admin

  Scenario: Direct navigation to blocked route redirects
    Given a user with role "user"
    When they visit /admin directly
    Then they are redirected away from /admin with an unauthorized indicator

  Scenario: Unauthenticated access redirects to /auth
    Given a visitor who is not signed in
    When they visit /dashboard
    Then they are redirected to /auth
```

---

## F5 — Live adapter switching / discovery from marketing site

The marketing site's adapter section (`PlatformCard`-style) links to each live
demo, and the demo advertises the other adapters.

**Gherkin:**

```gherkin
Feature: Live adapter discovery
  Each adapter card on the marketing site opens a working demo.

  Scenario: Supabase card links to the live demo
    Given the marketing site home or adapters section is loaded
    When a visitor clicks the Supabase adapter card
    Then they are taken to supabase.kavach.sensei-hq.com

  Scenario: A non-live adapter card is marked but disabled
    Given Auth0 is not configured as live
    When the adapter card renders
    Then it is labelled "coming soon" and not clickable as a live demo

  Scenario: Demo advertises sibling adapters
    Given a visitor is signed in on the Supabase demo
    When they open the footer or an "other adapters" section
    Then they see links to the Firebase and Convex demo sites
    And Auth0/Amplify appear as "coming soon" (no live link)
```

---

## F6 — Theme + density consistency

All demos share the marketing-site theme system (`[data-theme]`, `[data-density]`)
with a working toggle.

**Gherkin:**

```gherkin
Feature: Theme consistency across demos
  The demo app matches the marketing site look and feel.

  Scenario: Theme toggle works in the demo
    Given a signed-in user on any demo site
    When they toggle the theme
    Then the page re-renders with the alternative theme
    And no component flashes unstyled

  Scenario: Density toggle works in the demo
    Given the demo app is open
    When they toggle density
    Then section/card spacing changes accordingly

  Scenario: Shared kit honours reduced motion
    Given a user with reduced motion enabled
    When any demo animation would run
    Then it resolves to its end state immediately
```

---

## F7 — Verification

Automated checks (Playwright, mirroring the existing `sites/demo` per-adapter
suites) covering the above on every deployed demo.

**Gherkin:**

```gherkin
Feature: Demo verification
  Every adapter demo passes the same smoke suite before deploy.

  Scenario: Adapter smoke suite passes
    Given a deployed adapter demo (supabase, firebase, convex)
    When the Playwright suite for that adapter runs
    Then sign-in, route protection, role gating, and logout all pass

  Scenario: Shared kit has zero lint/test errors
    Given the sites/showcase package
    When its lint and unit tests run
    Then errors are zero

  Scenario: Public marketing site links resolve
    Given the marketing site is built
    When each live adapter card is crawled
    Then its demo URL returns 200
```

---

## Acceptance criteria (overall)

1. `sites/showcase` exists (kit + config) and is used by `sites/learn` and
   every demo site.
2. Shared config centralises routes/rules/copy; changing it updates all
   consumers.
3. Supabase, Firebase, and Convex demos are deployed to their own subdomains
   and pass sign-in E2E.
4. Not-yet-live adapters (Auth0, Amplify) render a graceful placeholder.
5. Marketing site adapter cards link to live demos; live demos link to sibling
   demos.
6. Theme + density toggles work in every demo.
7. Zero lint errors; the demo Playwright suites pass per adapter.

## Open questions

- Does the marketing site's `(demo)/demo` platform switcher (AUTH_MODES) stay
  as-is, or migrate to consume `sites/showcase` too? (Likely yes for
  consistency, but it is an interactive explainer, not a live demo.)
- Who provisions the Cloudflare Worker projects + custom domains — wrangler CLI
  per site, or a script (`sites/showcase/deploy.sh`)?
