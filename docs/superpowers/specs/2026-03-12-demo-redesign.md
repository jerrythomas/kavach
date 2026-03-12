# Demo Redesign — Design Spec

**Date:** 2026-03-12
**Status:** Approved

---

## Overview

Redesign the Kavach demo into an interactive learning experience — a real app users sign into and explore, augmented with contextual Kavach explanations. Shows auth guards, role-based access, and PostgREST-level security in action.

Also covers: bug fixes, Guardian → Sentry rename.

---

## Rename: Guardian → Sentry

Rename the `@kavach/guardian` package to `@kavach/sentry` across all source, docs, tests, and demo content. "Sentry" is shorter, less wordy, easier to use in conversation and UI copy. Treat as a separate story that runs alongside this work.

---

## Bug Fixes (prerequisite)

### 1. `new Response(object)` bug in `packages/auth/src/kavach.js`

Three locations pass a plain object as the `Response` body. The `Response` constructor coerces it with `.toString()` → `"[object Object]"`. Any client calling `.json()` on these responses gets `SyntaxError: "[object Object]" is not valid JSON`.

Fix: wrap with `JSON.stringify()` and add `Content-Type: application/json` header.

- Line 116: `new Response({}, { status: 303, ... })` → `new Response('', ...)`
- Line 123: `new Response({ error: ... }, ...)` → `new Response(JSON.stringify({ error: ... }), ...)`
- Line 179: `new Response({ session, error }, ...)` → `new Response(JSON.stringify({ session, error }), ...)`

### 2. `/data/facts` not in routing rules

Kavach's guardian treats `/data` as an endpoint route and returns 403 for authenticated users because `/data/facts` has no explicit rule. Fix: add `{ path: '/data/facts', roles: '*' }` to `kavach.config.js`.

### 3. Console log always on in `hooks.server.js`

The `[hook] pathname → status=` log fires in all environments. Remove it (or gate behind `import { dev } from '$app/environment'`). Remove it outright — the debug value is low.

---

## Route Architecture

Three surfaces, two layout trees.

### URL Structure

```
/demo                              public — platform selector landing
/demo/[platform]                   public — pre-auth platform page

/demo/[platform]/dashboard         protected (roles: *)
/demo/[platform]/data              protected (roles: *)
/demo/[platform]/admin             protected (roles: ['admin'])
/demo/[platform]/logout            protected
```

### Route Groups

```
routes/
  (demo)/
    demo/
      +layout.svelte          standalone shell (watermark, footer only)
      +page.svelte            platform selector
      [platform]/
        +page.svelte          pre-auth platform page
  (app)/
    demo/
      +layout.svelte          authenticated demo shell
      +layout.server.ts
      [platform]/
        dashboard/+page.svelte
        data/+page.svelte
        admin/+page.svelte + +page.server.ts
        logout/+page.svelte
  (server)/
    data/[...slug]/+server.ts   (unchanged)
```

### Updated `kavach.config.js` Rules

```js
rules: [
  { path: '/', public: true },
  { path: '/docs', public: true },
  { path: '/auth', public: true },
  { path: '/demo', public: true },
  { path: '/demo/supabase/dashboard', roles: '*' },
  { path: '/demo/supabase/data', roles: '*' },
  { path: '/demo/supabase/admin', roles: ['admin'] },
  { path: '/demo/firebase/dashboard', roles: '*' },
  { path: '/demo/firebase/data', roles: '*' },
  { path: '/demo/firebase/admin', roles: ['admin'] },
  // ... repeated for auth0, amplify, convex
  { path: '/data/facts', roles: '*' },
  { path: '/data/admin-stats', roles: ['admin'] }
]
```

### Navigation Flow

- `/demo` → select platform → `/demo/[platform]`
- Sign in on platform page → redirect to `/demo/[platform]/dashboard`
- Authenticated shell: no Kavach site chrome except small "Back to Kavach" in top bar
- Sign out → `/demo/[platform]` (back to platform page, not `/auth`)

---

## Surface 1: `/demo` — Platform Selector Landing

**Layout:** Full-screen standalone. No Kavach site header or nav.

**Visual:**

- Large faded Kavach wordmark as background watermark
- Theme switcher top-right
- Headline: "Kavach Demo" + two-line descriptor
- Platform cards in a responsive grid (3 across, 2 below)
- Footer: "← Back to Kavach" link to `/`

**Platform card anatomy:**

- Large Rokkit auth icon (`auth:supabase`, `auth:firebase`, etc.) — top, prominent
- Platform name + LIVE / MOCK badge
- 3–4 bullets: "What you'll explore" (password auth, magic link, RBAC, PostgREST guards)
- Hover: card lifts, subtle border glow
- Click → `/demo/[platform]`

**Platforms:** Supabase (LIVE), Firebase (MOCK), Auth0 (MOCK), Amplify (MOCK), Convex (MOCK)

---

## Surface 2: `/demo/[platform]` — Pre-Auth Platform Page

**Layout:** Same standalone shell. Platform identity prominent.

**Structure:**

- Top: back arrow, large platform icon, platform name, one-line description, theme switcher
- Tab bar: `All` · `Password` · `Magic Link` · `Cached` · `Social`
- Two-column below tabs: left = mode explainer, right = live auth form
- Footer: "← Back to Kavach"

**Tab behaviour:**

- Each tab shows the explainer for that mode + the live auth form for that provider
- `All` tab: all available providers stacked + full capability matrix
- Unsupported tabs: visible but disabled with tooltip "Not supported by this adapter"
- Social tab (Supabase): Google only as configured; GitHub/Apple/etc shown as disabled with "add to config" hint

**Mode explainer (left panel):**

- What this auth mode is
- How Kavach wires it (bullet flow: credentials → adapter → session cookie → Sentry checks every request)
- Capability badges: what Kavach handles vs what the adapter handles
  - ✓ Server-side session cookie, role resolution, token refresh, cached login
  - ✗ items not applicable to this mode

**Live form (right panel):**

- Actual auth form using kavach's AuthProvider component, scoped to selected mode
- "Use test credentials" link → pre-fills `test@test.com` / `password123`
- On success → redirect to `/demo/[platform]/dashboard`

---

## Surface 3: Authenticated Demo Shell

**Top bar:**

- Left: app icon + "DemoApp" name
- Centre: platform name + subtle platform icon badge
- Right: theme switcher + user avatar + name + role chip

**Sidebar (left, fixed):**

1. **Navigation**
   - Dashboard
   - Space Facts
   - Admin (always visible; lock icon for non-admin)
   - Sign Out

2. **Your Role card**
   - Live role badge (`authenticated` / `admin`)
   - Access matrix: which routes are allowed/blocked for current role
   - Updates if role changes

3. **Sentry Config** (collapsible)
   - Shows actual rules from `kavach.config.js` governing the session
   - Colour-coded by current user's access (green = allowed, red = blocked)
   - Example:
     ```
     /demo/supabase/dashboard  roles: *      ✓ allowed
     /demo/supabase/data       roles: *      ✓ allowed
     /demo/supabase/admin      roles: admin  ✗ blocked
     /data/facts               roles: *      ✓ allowed
     /data/admin-stats         roles: admin  ✗ blocked
     ```

4. **App Mode / Hacker Mode toggle**
   - App Mode: normal UX — Sentry works silently, UI respects roles (admin locked, writes hidden)
   - Hacker Mode: UI shows everything; security enforcement surfaced visually (red flash, "Sentry blocked this request", raw 403 response shown)

**Floating badge (bottom-right, always visible):**

- Two stacked icons: Kavach `⬡` + platform icon
- Tooltip: "Powered by Kavach · Supabase adapter"
- Subtle pulse in Hacker Mode

---

## Content Pages

### Dashboard (`/demo/[platform]/dashboard`)

- Welcome card: user email, role badge, sign-in method used
- Quick-access cards to other pages, with access indicator per role
- Access log: last 5 navigation events with Sentry status (allowed / blocked / redirected)
- Brief explainer: "This page is protected by `roles: *` — any authenticated user can access it"

### Space Facts (`/demo/[platform]/data`)

- Load Facts button → fetches `/data/facts`
- General facts visible to all authenticated users
- Classified facts visible to admin only (PostgREST RLS + Kavach role filter)
- Sentry annotation panel: "This data is filtered server-side. Admin sees 8 facts, you see 5."
- In Hacker Mode: "Try `/data/admin-stats`" button fires the request and shows raw 403 response inline

### Admin Panel (`/demo/[platform]/admin`)

- **Admin user:** full panel — session info, user management placeholder, system settings placeholder
- **`authenticated` user in App Mode:** immediate redirect to dashboard + toast "Sentry redirected you — this route requires `admin` role"
- **`authenticated` user in Hacker Mode:** lands on page, sees the actual 403 response with the Sentry rule that triggered it. Visual emphasis on which rule blocked access.

### Three security layers demonstrated:

1. **UI guard → redirect:** Admin route redirects non-admin to dashboard (App Mode default)
2. **UI guard → forbidden:** Admin route shows 403 in-place (Hacker Mode, or configurable per platform)
3. **DB guard:** `/data/facts` returns role-filtered data; `/data/admin-stats` returns 403 from PostgREST RLS even if the UI sends the request

---

## Demo Data

- `/data/facts` — existing seed data (5 general + 3 classified), RBAC filtering by role
- `/data/admin-stats` — new endpoint, admin-only, returns simple demo stats (user count, fact count etc.)

---

## Platforms

| Platform | Status | Auth Modes                             | Notes                        |
| -------- | ------ | -------------------------------------- | ---------------------------- |
| Supabase | LIVE   | Password, Magic Link, Cached, (Google) | Real Supabase local instance |
| Firebase | MOCK   | Password, Social                       | Mocked adapter responses     |
| Auth0    | MOCK   | Password, Social                       | Mocked adapter responses     |
| Amplify  | MOCK   | Password, Social                       | Mocked adapter responses     |
| Convex   | MOCK   | Password                               | Mocked adapter responses     |

Mock platforms: sign-in always succeeds with test credentials, session is fabricated, RBAC demo still works.

---

## What Is Not Changing

- `/auth` page — kept as-is (still used as fallback)
- Docs site — unchanged
- Kavach learn site homepage — unchanged
- `(server)/data/[...slug]/+server.ts` — kept, with `/data/admin-stats` added
- Core kavach packages (except Guardian → Sentry rename)

---

## Stories This Generates

1. **Bug fixes** — Response body, `/data/facts` rule, remove console.log
2. **Guardian → Sentry rename** — package, source, docs, demo
3. **Demo landing page** — `/demo` platform selector
4. **Pre-auth platform page** — `/demo/[platform]` with tabs
5. **Authenticated demo shell** — new layout, sidebar, floating badge
6. **Content pages** — Dashboard, Space Facts, Admin (reskinned with learning augmentation)
7. **Hacker Mode** — bypass toggle, visual Sentry enforcement feedback
8. **Mock platform adapters** — fabricated sessions for non-Supabase platforms
9. **`/data/admin-stats` endpoint** — admin-only server route for demo
