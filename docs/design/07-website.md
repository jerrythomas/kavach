# Learn Site Unification — Design Blueprint

## Purpose

Define the target architecture, content topology, and delivery workflows for a unified Kavach website that:

- Presents informational, documentation, and demo experiences in one cohesive property.
- Meets the Verification features (docs/features/07-Verification.md)
- Meets the Publish features (docs/features/08-Publish.md).
- Harmonizes the best elements from the current `sites/demo`, `sites/learn`, and `sites/skeleton` implementations.

## Goals & Non‑Goals

| Type      | Description                                                                                   |
|-----------|-----------------------------------------------------------------------------------------------|
| Goals     | Single SvelteKit codebase delivering informational content, docs, demos, and verification stats. |
|           | Shared UI/UX language with reusable layouts and components.                                   |
|           | Clear separation between content (markdown, config) and presentation (Svelte wrappers).       |
|           | Automation hooks for verification outputs and publish-time metadata.                          |
| Non-goals | Rewrite of adapter core libraries; use existing packages (`@kavach/*`).                       |
|           | Implementing actual verification harnesses (covered by separate stories).                     |
|           | Introducing new CI/CD tooling beyond integration points described below.                      |



## Target Architecture

### Directory Layout (proposed)

```
solution/sites/learn/
  package.json
  svelte.config.js
  vite.config.ts
  supabase/               # platform-specific assets (seed, env templates)
  src/
    lib/
      ui/                 # shared shells extending @rokkit/ui components and custom banners
      analytics/          # telemetry emitters, adapters
      verification/       # run metadata parsers, banner context
      demos/
        context/          # adapter selection helpers shared across platforms
        scenarios/        # Wordle, Todos, etc. (platform-agnostic)
      content/
        public/           # hero copy, highlight lists
        docs/             # markdown adapters, llms manifest generator
        data/             # JSON data sources (roles, FAQ)
    routes/
      +layout.svelte      # global shell with navigation, theming
      +layout.ts          # load verification metadata for banners
      +page.svelte        # home landing page (hero, CTA, etc.)
      about/+page.svelte
      docs/
        +layout.svelte    # shared docs shell
        [slug]/+page.ts   # loader for markdown-based docs
      demos/
        [platform]/       # adapter context (supabase, firebase, auth0, etc.)
          +layout.ts      # sets adapter context based on slug
          +layout.svelte  # demo menu & role switcher
          (public)/+page.svelte
          (public)/logs/+page.svelte           # viewer for audit log instrumentation
          (protected)/+page.svelte
          (server)/data/+server.ts # server side data access endpoints
          (server)/api/+server.ts # server side apis wrapping data access
          ...
      verification/+page.svelte   # exposes run history, export links
      api/
        verification/+server.ts   # surfaces verification JSON
  static/
    llms.txt              # generated during publish
    assets/               # shared images, icons
  e2e/                    # Playwright suites aligned with verification matrix
```

### Layout & Components

- **Global layout** for navigation, theme toggles, verification banner.
- **Favicon**: Use `@kavach/ui` icon (shield/lock symbol) as site favicon.
- **Section-specific layouts**:
  - Public/informational landing.
  - Documentation (left nav, right-side TOC).
  - Demo workspace with sticky role switcher and telemetry console.
- **Component library** (within `src/lib/ui`):
  - Wraps `@rokkit/ui` primitives (buttons, cards, accordions, metric badges, tabs) with site theming.
  - Custom `AlertToast` component provides alerts/toasts used across public, docs, and demo areas.
- **Content ingestion**:
  - Markdown/MDsveX for docs/tutorials.
  - JSON/YAML for informational bullet points and demo listings.
  - Config-driven platform gallery referencing verification outputs.

### Data Flows

- **Verification metadata**: produced by the verification pipeline, stored as JSON artifacts (e.g., `static/verification/latest.json` and history). Loaded via `load` functions for banners/tables.
- **Publish metadata**: release version, timestamp, origin commit. Stored in `static/publish.json` and used for footers and API endpoints.
- **Adapter context**: `[platform]` slug selects adapter from a shared registry (Supabase, Firebase, Auth0, Amplify, Convex) without platform-specific UI branches.

## Content Architecture

| Content Type         | Source / Storage                                         | Render Strategy                                             |
|----------------------|----------------------------------------------------------|-------------------------------------------------------------|
| Public copy          | `src/lib/content/public/*.ts` or `.md`                   | Static import into home page components.                    |
| Documentation        | Markdown files under `docs/` (existing repo)             | Use `docs` route loader; allow cross-linking and search.    |
| Demo scenarios       | Svelte components referencing shared stores/context.     | Role-aware components; instrumentation for telemetry.       |
| Verification stats   | JSON artifacts+`src/lib/verification` utilities.         | Banner + `/verification` page + embed in demos.             |
| Publish metadata     | JSON generated at build/publish.                         | Footer display + optional `/status` API.                    |
| llms manifest        | Derived from docs index builder at publish time.         | Deployed to `static/llms.txt`.                              |

## Verification Alignment

### Required Hooks

1. **Smoke test orchestrations** hook into unified routes and components.
   - Provide fixtures for role login, adapter selection, and telemetry verification.
   - Make sure route naming remains stable (`/demos/...`).

2. **Performance testing**:
   - Ensure landing, docs, demos share layout to reduce metric variance.
   - Provide `?perf=1` route query to disable animations (for benchmarking consistency).

3. **Security validation**:
   - Expose test-only endpoints (guarded by environment flag) to simulate expired tokens, invalid roles.
   - Logging instrumentation uses `@kavach/logger` pipeline to feed `audit.logs`.

4. **Documentation checks**:
   - Build-time script exports docs index (for search, llms, verification).
   - Provide CLI commands: `bun run docs:build`, `bun run docs:verify`.
   - Ensure `llms.txt` generation runs post docs build.

5. **Telemetry assertions**:
   - Implement telemetry dispatchers in `src/lib/analytics`.
   - Provide `verification` flag to route telemetry to test sinks during verification runs.
   - Surface instrumentation through the `/logs` viewer so verification can assert captured events.

6. **Publish readiness report**:
   - Generate `static/verification/report.json` summarizing pass/fail; referenced by Publish features.

## Publish Alignment

- **Publication Gate**: Publish pipeline must require latest verification artifact signature; use `publish.json` combined with `report.json` to enforce gating.
- **Verification stats display**:
  - Global store `src/lib/verification/store.ts` loads latest stats.
  - Banner component showing last run timestamp, status badge, adapter versions.
  - `/verification` page displaying table, history dropdown linking to archived reports (e.g., stored in `static/verification/history/*.json`).

- **About page**: curated copy referencing capabilities, platform list, quick-start CTAs.

- **Usage documentation hub**:
  - Build docs navigation (sidebar) from docs metadata.
  - Provide search with prebuilt index (e.g., Algolia-style JSON) regenerated during publish.

- **Multi-platform demo gallery**:
  - Config-driven list of platform demos with environment badge pulling from verification metadata.
  - Each entry links to a route with pre-selected adapter context.

- **Content deployment pipeline**: Publish pipeline packages informational content, docs, demos:
  - Step 1: run verification suite.
  - Step 2: generate `publish.json`, docs index, llms manifest, verification artifacts.
  - Step 3: atomic deploy (CI ensures single release window).
  - Step 4: trigger post-publish confirmation (Playwright smoke on production).

## Implementation Guidelines

1. **Repository Consolidation**
   - Retire separate `demo` and `skeleton` site code; migrate reusable assets into unified `learn`.
   - Extract shared UI from `demo` into `src/lib/ui`.
   - Align TypeScript configs; adopt `tsconfig` references for consistent tooling.

2. **Routing Strategy**
   - Use nested layouts: `/` (public) → `/docs` → `/demos` → `/status` (optional).
   - Provide fallback 404 and unauthorized pages referencing `@kavach/guardian` behaviour but avoid implementation naming in UI copy.

3. **State Management**
   - Minimal stores for verification and publish metadata; prefer `load` functions with caching.
   - Role switcher uses `writable` store, persists to session/local storage.

4. **Documentation Integration**
   - Use MDsveX or custom markdown loader; ensure consistent frontmatter (title, summary, tags).
   - Build search index JSON at docs build time; include in static assets.

5. **Theme & Styling**
   - Continue using UnoCSS (present in existing sites).
   - Use semantic color tokens from `@rokkit/ui` design system:
     - Backgrounds: `bg-surface-z1` (darkest), `bg-surface-z2`, `bg-surface-z3`, `bg-surface-z4` (lightest)
     - Text: `text-surface-z8` (primary), `text-surface-z7` (secondary), `text-surface-z6` (muted)
     - Borders: `border-surface-z3`, `border-surface-z4`
     - Interactive: `bg-primary`, `text-on-primary`, `hover:bg-primary-z6`
   - Example page structure:
     ```svelte
     <main class="bg-surface-z2 text-surface-z8">
       <h1 class="text-surface-z9">Heading</h1>
       <p class="text-surface-z7">Body text</p>
       <button class="bg-primary text-on-primary hover:bg-primary-z6">Action</button>
     </main>
     ```
   - Support light/dark mode toggles persisted per user.

6. **Telemetry & Analytics**
   - Standardize event payload shape in `src/lib/analytics/events.ts`.
   - Provide environment-based endpoints (e.g., log to console in dev, to logger adapter in prod).
   - Tie into verification telemetry assertions.

7. **Testing Alignment**
   - Playwright suites under `e2e` with spec groups: informational landing, docs, demos, verification banner.
   - Provide `bun run test:smoke --adapter=supabase` command to match verification requirements.

8. **Build/Deploy Scripts**
   - `bun run build` triggers docs pipeline, verification metadata refresh (in preview environments).
   - `bun run publish:prepare` generates `llms.txt`, `publish.json`, verification stats (consuming latest verifying artifacts).
   - Provide CLI script to sync platform demos (Supabase seed, etc.).

## Implementation Phases (High-Level)

| Phase | Focus                                                                                  | Outputs                                                                                 |
|-------|-----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| 1     | Architecture setup                                                                      | Unified `learn` project skeleton, layout scaffolding, shared UI extraction.             |
| 2     | Content migration                                                                       | Port landing, docs, and demos; ensure markdown + demos functional.                      |
| 3     | Verification integration                                                                | JSON artifact loaders, verification banner/page, telemetry hooks, test harness support. |
| 4     | Publish pipeline integration                                                            | Publish metadata generation, llms manifest, atomic deploy scripts.                      |
| 5     | QA & handover                                                                           | Playwright coverage, documentation of processes, retire old site directories.           |

## Risks & Mitigations

| Risk                                   | Mitigation                                                                                         |
|----------------------------------------|----------------------------------------------------------------------------------------------------|
| Inconsistent TypeScript definitions    | Establish shared `tsconfig.base.json` and run strict type checks during migration.                 |
| Duplicated components during migration | Track audit list; remove legacy components once unified versions are proven.                       |
| Verification data staleness            | Force publish pipeline to fail if verification artifacts older than configured threshold (e.g., 24h). |
| llms manifest drift                    | Add verification step ensuring `llms.txt` references actual content; fail build on mismatch.       |
| Demo environment drift                 | Provide environment config validation script (ensures Supabase seed, env vars exist).             |



This design should guide the engineering effort to consolidate the Learn site, satisfy verification and publish requirements, and provide a maintainable structure for future expansion.
