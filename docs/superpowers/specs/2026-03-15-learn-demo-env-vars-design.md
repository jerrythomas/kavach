# Learn Site Demo Env Vars — Design Spec

## Goal

Wire up the learn site so that its three demo platform links (Supabase, Firebase, Convex) are driven by environment variables rather than hardcoded URLs. Simultaneously remove the embedded Supabase auth from the learn site, making it a pure landing/docs site.

## Architecture

### Environment Variables

Three new public env vars, added to `.env` files:

| Variable                   | Local value             | Production value                   |
| -------------------------- | ----------------------- | ---------------------------------- |
| `PUBLIC_DEMO_SUPABASE_URL` | `http://localhost:4173` | `https://supabase.demo.kavach.dev` |
| `PUBLIC_DEMO_FIREBASE_URL` | `http://localhost:4174` | `https://firebase.demo.kavach.dev` |
| `PUBLIC_DEMO_CONVEX_URL`   | `http://localhost:4175` | `https://convex.demo.kavach.dev`   |

Files to update:

- `sites/learn/.env` — local values (already gitignored or example-only)
- `sites/learn/.env.example` — document all required vars
- Production env vars set in Vercel dashboard (not in repo)

### `platforms.ts` Changes

`sites/learn/src/lib/demo/platforms.ts` currently hardcodes Firebase and Convex URLs and has no URL for Supabase (embedded). After this change, all three read from `$env/dynamic/public`:

```ts
import { env } from '$env/dynamic/public'

// In each platform config:
url: env.PUBLIC_DEMO_SUPABASE_URL
url: env.PUBLIC_DEMO_FIREBASE_URL
url: env.PUBLIC_DEMO_CONVEX_URL
```

### Dead Code Removal

The learn site currently has embedded Supabase auth. Remove entirely:

| Path                                    | Action                  |
| --------------------------------------- | ----------------------- |
| `sites/learn/kavach.config.js`          | Delete                  |
| `sites/learn/src/hooks.server.js`       | Delete                  |
| `sites/learn/src/routes/(app)/`         | Delete entire directory |
| `sites/learn/src/routes/(server)/data/` | Delete entire directory |

### Dependency Cleanup

Remove from `sites/learn/package.json`:

- `@kavach/adapter-supabase`
- `@supabase/supabase-js`

Any transitive deps that become orphaned are pruned via `bun install`.

## Testing

### E2E (`sites/learn/e2e/demo.e2e.ts`)

The existing file tests an embedded demo at `/demo/supabase/dashboard` etc. — those routes are being deleted. Auth flow coverage (redirects, login, dashboard, data, admin) already lives in `sites/demo/e2e/demo.e2e.ts` and does not need to be moved.

**Remove** all tests that depend on embedded auth (already covered by demo e2e):

- Sign-in flow tests (`/auth` page with Supabase providers)
- Unauthenticated redirect tests (`/demo/supabase/dashboard → /auth`)
- Authenticated page tests (dashboard, admin, data)
- Platform-variation sign-in UI tests (`/demo/firebase/dashboard` etc.)
- Navigation between embedded demo pages

**Replace with**:

- Demo landing loads: `h1` visible, platform cards with correct hrefs
- External links: each card `href` matches env var URL (or expected pattern)
- No auth-dependent state required

### Unit Tests

No new unit tests needed — `platforms.ts` is a config object. The env var wiring is verified by the e2e tests.

### Manual Verification Checklist

1. `cd sites/learn && bun run dev` — site loads, no auth errors in console
2. Platform cards show correct URLs from env
3. Clicking a demo card opens external link to correct demo site
4. `bun run build` succeeds with no missing-env-var errors
5. E2E: `bunx playwright test` — all tests pass

## Out of Scope

- Auth0 and Amplify demo sites — remain inactive, no URLs added
- Redesigning the learn site UI — layout/cards unchanged
- Setting up the three demo sites themselves — they are assumed to already exist at their URLs
