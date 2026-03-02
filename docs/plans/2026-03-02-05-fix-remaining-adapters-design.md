# Fix Remaining Adapters Design

## Goal

Bring all adapters (Amplify, Auth0, Firebase) to the same quality standard as Supabase: refactored to the new plugin architecture, with comprehensive tests and verified auth flows.

## Current State

| Adapter | Tests | Plugin Pattern | Completeness |
|---------|-------|---------------|--------------|
| Supabase | 6 spec files | Yes (refactored) | High |
| Convex | 1 spec file | Yes (new) | Moderate |
| Amplify | None | No (old pattern) | Partial |
| Auth0 | None | No (old pattern) | Partial |
| Firebase | None | No (old pattern) | Partial |

### Amplify Adapter Issues
- Uses `aws-amplify` v6 but implementation may be incomplete
- `onAuthChange` noted as "not directly applicable with Cognito"
- No tests
- Still uses old monolithic pattern (may have `actions`/`proxy`)

### Auth0 Adapter Issues
- No direct Auth0 SDK in dependencies (references `@auth0/auth0-spa-js` in comments)
- Async `getAdapter()` — different from other adapters
- Redirect-based OAuth flow needs custom callback handling
- No tests

### Firebase Adapter Issues
- Uses `@firebase/app` and `@firebase/auth`
- Exports `adapter()` function (different naming from `getAdapter()`)
- Has OAuth provider map but may not cover all modes
- No tests

## Proposed Work Per Adapter

### Common Changes (all 3 adapters)

1. **Refactor to plugin pattern:**
   - `getAdapter(client)` accepts pre-created SDK client
   - Return only auth methods (no `actions`, no `proxy`)
   - Consistent naming: `getAdapter` (not `adapter`)

2. **Add test suite:**
   - Mock the SDK client
   - Test all auth modes the adapter supports
   - Test `transformResult` normalization
   - Test error handling

3. **Update package.json:**
   - Ensure correct SDK dependency versions
   - Add `kavach: workspace:*` dependency

4. **Update index.js exports:**
   - Consistent with supabase/convex pattern

### Amplify-Specific

```js
// Before
import { getAdapter } from '@kavach/adapter-amplify'
const adapter = getAdapter(config)

// After
import { Amplify } from 'aws-amplify'
import { getAdapter } from '@kavach/adapter-amplify'
Amplify.configure(config)
const adapter = getAdapter(Amplify)
```

Auth modes to support: password (Cognito), OAuth (social providers), OTP (if Cognito supports it).

### Auth0-Specific

```js
// Before (async!)
import { getAdapter } from '@kavach/adapter-auth0'
const adapter = await getAdapter(config)

// After
import { Auth0Client } from '@auth0/auth0-spa-js'
import { getAdapter } from '@kavach/adapter-auth0'
const auth0 = new Auth0Client({ domain, clientId })
const adapter = getAdapter(auth0)
```

Fix: Make `getAdapter` synchronous (consistent with other adapters). The Auth0 client handles async internally.

Auth modes: OAuth (redirect-based), password (if Universal Login configured).

### Firebase-Specific

```js
// Before
import { adapter } from '@kavach/adapter-firebase'
const auth = adapter(config)

// After
import { initializeApp } from '@firebase/app'
import { getAuth } from '@firebase/auth'
import { getAdapter } from '@kavach/adapter-firebase'
const app = initializeApp(config)
const auth = getAuth(app)
const adapter = getAdapter(auth)
```

Fix: Rename from `adapter()` to `getAdapter()`. Accept Firebase Auth instance.

Auth modes: password, OAuth (Google, GitHub, etc.), OTP (phone), anonymous.

## E2E Testing

### Learn Site E2E Tests

Add Playwright tests for the learn site covering:
- Page navigation
- Documentation rendering
- Live example auth flow (if using a test Supabase project)

### Adapter Verification Strategy

For adapters without a dedicated example site:

**Option A: Shared test harness** — a single SvelteKit app that can be configured to use any adapter via env vars. Run E2E tests per-adapter.

**Option B: Unit tests only** — comprehensive mock-based tests for each adapter. Rely on the CLI + learn site for integration verification.

**Recommendation:** Option B for now. E2E tests for individual adapters require real backend credentials and infrastructure. Unit tests with mocked SDKs provide sufficient coverage for the adapter layer.

## Security Verification

For each adapter:
- Verify tokens are never exposed to client-side JavaScript (httpOnly cookies)
- Verify session synchronization handles token refresh correctly
- Verify error responses don't leak sensitive information
- Document adapter-specific security considerations

## Performance Verification

- Measure adapter initialization time (cold start)
- Measure auth flow round-trip time
- Ensure no unnecessary SDK imports (tree-shaking friendly)

## Execution Order

1. Firebase adapter (most complete starting point)
2. Amplify adapter
3. Auth0 adapter
4. E2E tests for learn site
5. Security/performance audit across all adapters

## Open Questions

- Do we need example sites for each adapter, or is the CLI + docs sufficient?
- Should adapters that don't support certain auth modes (e.g., Auth0 lacks native OTP) throw helpful errors or silently no-op?
- Should we add adapter capability detection (e.g., `adapter.supports('passkey')`)?
