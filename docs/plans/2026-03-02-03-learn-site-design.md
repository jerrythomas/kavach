# Learn Site Update Design

## Goal

Transform the learn site into a comprehensive documentation hub with modern design, working examples, LLM-friendly content, and a live Supabase auth demo.

## Current State

The learn site (`sites/learn/`) is a slide-based presentation using `@rokkit` components. It has:
- A `Slide.svelte` component with `slides.json` content
- `@rokkit/themes` for styling
- Playwright + Vitest configured but likely minimal test coverage
- No docs, no examples, no llms.txt

## Proposed Changes

### 1. Documentation Structure

Convert from slide-based to a proper documentation site:

```
src/routes/
├── +page.svelte              # Landing page
├── docs/
│   ├── getting-started/      # Quick start guide
│   ├── concepts/             # Auth, Deflector, DataAdapter, etc.
│   ├── adapters/
│   │   ├── supabase/
│   │   ├── convex/
│   │   ├── auth0/
│   │   ├── firebase/
│   │   └── amplify/
│   ├── ui-components/        # Component docs with live examples
│   ├── api/                  # API reference
│   └── migration/            # Migration guides
├── examples/
│   └── supabase-auth/        # Live working example
└── llms.txt                  # LLM-friendly content index
```

### 2. Modern Look and Feel

- Replace slide-based layout with sidebar navigation + content area
- Use `@rokkit/ui` components for consistent design
- Dark/light mode support via `@rokkit/themes`
- Responsive layout (mobile-friendly docs)
- Code syntax highlighting with Prism.js (already a dep in other sites)

### 3. Branding

- Kavach logo and brand colors
- Consistent typography (use existing @fontsource fonts from other sites)
- "kavach" = "armor/shield" in Hindi — security-focused visual identity

### 4. llms.txt

Generate `llms.txt` at build time from documentation content:
```
# kavach - Authentication library for SvelteKit

## Packages
- kavach: Core authentication orchestration
- @kavach/adapter-supabase: Supabase auth adapter
- @kavach/adapter-convex: Convex auth adapter
- @kavach/ui: Svelte auth UI components
...

## API
createKavach(adapter, options) → { signIn, signUp, signOut, ... }
...
```

### 5. Live Supabase Auth Example

Port key pages from `sites/supabase/` into the learn site as a working demo:
- Login page with OAuth + password
- Protected dashboard page
- Session handling

This serves as both documentation and proof that kavach works end-to-end.

### 6. Update Design Documents

Review and update all files in `docs/`:
- `docs/design/` — verify against current code
- `docs/requirements/` — update to match implemented features
- Remove outdated references to pre-plugin architecture

### 7. Performance and Security

**Performance:**
- Lighthouse audit on built site
- Ensure SSR works correctly for SEO
- Lazy-load heavy content (code examples, live demos)

**Security verification:**
- Document kavach's security model (session handling, CSRF, XSS prevention)
- Add a "Security" page to docs covering:
  - How sessions are stored (httpOnly cookies)
  - How route protection works (deflector)
  - Token handling best practices

## Tech Stack

Keep existing: SvelteKit + @rokkit + @unocss. Add:
- `mdsvex` — markdown content with Svelte components (already used in supabase site)
- Code highlighting already available via Prism.js

## Testing

- Playwright E2E tests for navigation, example pages
- Visual regression tests for key pages
- Lighthouse CI for performance benchmarks
- Accessibility audit (a11y)

## Open Questions

- Should the live example use a shared Supabase project or require users to configure their own?
- Should docs support versioning (v1, v2)?
- Should we auto-generate API docs from JSDoc in source files?
