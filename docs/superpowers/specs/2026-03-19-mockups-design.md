# Mockups: Learn Site Redesign + FitTrack Demo

**Date:** 2026-03-19
**Status:** Approved

---

## Scope

Two parallel mockup tracks, all under a `/mockups` route in `sites/learn`. Each option is a full Svelte page using the existing UnoCSS + Rokkit stack — no HTML-only prototypes, no double-work on rebuild.

A side task: report the Rokkit `List` collapsible bug on `jerrythomas/rokkit`.

---

## Route Structure

```
sites/learn/src/routes/
  (mockups)/
    +layout@.svelte          ← resets from public layout; adds mockup switcher bar
    mockups/
      +page.svelte           ← index: cards linking to all 5 mockups
      learn-a/+page.svelte   ← Learn option A: Sidebar-first editorial
      learn-b/+page.svelte   ← Learn option B: Top-nav + hub home
      learn-c/+page.svelte   ← Learn option C: Command-palette first
      demo-a/
        +page.svelte         ← FitTrack option A: Coach/athlete split
        [screen]/+page.svelte ← sub-screens: login, dashboard, coach, hacker
      demo-b/
        +page.svelte         ← FitTrack option B: Gym management SaaS
        [screen]/+page.svelte ← sub-screens
```

The `(mockups)` route group uses `+layout@.svelte` to break out of the public layout. The layout adds a thin top bar: "← Back to site" + mockup switcher tabs.

---

## Shared Mock Data (`$lib/mockups/`)

### fitness-data.ts

```ts
// Users
{ id: 'u1', name: 'Alex Rivera', role: 'athlete', plan: 'Strength 12-Week', coach: 'c1' }
{ id: 'u2', name: 'Sam Park', role: 'athlete', plan: 'HIIT Fundamentals', coach: 'c1' }
{ id: 'u3', name: 'Jordan Wu', role: 'athlete', plan: 'Mobility & Recovery', coach: 'c2' }

// Coaches
{ id: 'c1', name: 'Coach Maya', role: 'coach', athletes: ['u1','u2'], specialty: 'Strength & HIIT' }
{ id: 'c2', name: 'Coach Raj', role: 'coach', athletes: ['u3'], specialty: 'Mobility & Recovery' }

// Admin
{ id: 'a1', name: 'Admin', role: 'admin' }

// Today's workout (for athlete view)
{ name: 'Upper Body Power', exercises: ['Bench Press 4x6', 'Pull-ups 4x8', 'OHP 3x10'], duration: '45 min' }

// Program progress
{ completed: 14, total: 36, streak: 5 }
```

### nav-data.ts — shared docs nav structure (used in learn-a, learn-b, learn-c)

---

## Track 1 — Learn Site Options

### Option A: Sidebar-first editorial

**Inspired by:** Linear Docs, Prisma Docs

Layout: 3-column — wide left sidebar (280px) | content | right TOC
Sidebar: icons + labels, section grouping with dividers, inline search input at top, collapsible sub-groups, active item highlighted with primary accent
Typography: `text-4xl font-black` headings, generous line-height, colored callout blocks (`tip`, `warning`, `note`) with left border accent
Content: sample "Quick Start" page with rich formatting
Color: surface-based with primary accent strip on active nav item

### Option B: Top-nav + hub home

**Inspired by:** Stripe Docs, Vercel Docs

Layout: top nav bar (Docs | Demo | API | GitHub) + hero home that's a category hub
Home: large icon cards per topic area (Getting Started, Adapters, Configuration, Components) — not a platform grid
Docs: 2-column (sidebar left + content), no right TOC (headings in sidebar instead)
Sidebar: narrower (220px), flat list with grouped sections, section labels as uppercase dividers
Navigation: top bar section tabs switch the sidebar context

### Option C: Command-palette first

**Inspired by:** Raycast Docs, Zed Docs

Layout: minimal top bar (logo + ⌘K search + GitHub), centered content (max-w-2xl), no persistent sidebar
Home: search-focused — large search input as hero element, recent/popular pages below
Docs: reading-first — wide centered layout, floating sidebar TOC on right, breadcrumb navigation
Command palette: `⌘K` opens a modal with fuzzy search across all docs sections (static mock, no real search)
Keyboard nav: escape to close, arrow keys to navigate results

---

## Track 2 — FitTrack Demo Options

Both options share:

- A screen switcher (tabs at top of mockup) to navigate between screens
- Auth state displayed clearly (who is logged in, what role)
- **Hacker mode panel**: toggle that shows what happens when an unauthorized user tries to access protected routes — visualized as a split view or overlay showing the blocked request + redirect

### Option A: Coach + athlete split

**Theme:** dark athletic — near-black background, electric accent (cyan/green), bold typography

**Screens:**

1. **Login** — clean centered card (keep feel of existing login page), role selector (athlete/coach for demo purposes)
2. **Athlete dashboard** — today's workout card, program progress bar, streak indicator, upcoming sessions, coach message
3. **Coach dashboard** — athlete roster cards (with status indicators), session calendar, program assignment panel
4. **Admin panel** — user management table, coach assignments, system config (role-gated, coach/athlete sees "Access Denied")
5. **Hacker mode** — toggle shows: attempted URL, sentry rule triggered, redirect destination, request log

**Role-based access visualization:**

- Each nav item shows a lock icon + tooltip explaining required role
- Accessing a forbidden route shows an animated "BLOCKED" overlay before redirect

### Option B: Gym management SaaS

**Theme:** light professional — white/gray surface, indigo accent, clean table-heavy UI

**Screens:**

1. **Login** — multi-tenant aware (gym name in header), email + password
2. **Member dashboard** — membership status, class bookings, trainer assignment, check-in history
3. **Trainer view** — client list, session scheduler, progress notes per client
4. **Admin view** — gym overview stats, trainer management, billing, member roster
5. **Hacker mode** — terminal-style log panel showing blocked requests in real time

---

## Collapsible Bug Report (side task)

The `List` component in `@rokkit/ui` receives `collapsible={true}` in the docs sidebar but groups render collapsed by default with no visible toggle working. File issue on `jerrythomas/rokkit` with:

- Reproduction: `List` with nested items, `collapsible={true}`, groups start collapsed
- Expected: groups expanded by default OR toggle clearly visible and functional
- Actual: groups appear collapsed, interaction unclear

---

## Components to Create (`$lib/mockups/`)

| Component               | Used by                           |
| ----------------------- | --------------------------------- |
| `MockupLayout.svelte`   | All 5 — thin chrome, switcher bar |
| `MockupNav.svelte`      | learn-a, learn-b sidebar nav      |
| `FitTrackLogin.svelte`  | demo-a, demo-b screen 1           |
| `HackerPanel.svelte`    | demo-a screen 5, demo-b screen 5  |
| `AthleteCard.svelte`    | demo-a coach dashboard            |
| `WorkoutCard.svelte`    | demo-a athlete dashboard          |
| `ProgressRing.svelte`   | demo-a athlete dashboard          |
| `RosterTable.svelte`    | demo-b trainer/admin view         |
| `CommandPalette.svelte` | learn-c                           |

---

## UnoCSS additions (uno.config.js)

Safelist additions for mockup-specific dynamic classes (hacker mode colors, role badge variants).

---

## Excluded from scope

- No routing logic / auth wiring — mockups use static mock data only
- No server-side code
- Real search in learn-c — command palette is static/visual only
- Mobile responsiveness — desktop-first mockups only
