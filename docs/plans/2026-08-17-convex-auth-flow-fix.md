# Fix Convex Adapter Auth Flow

## Problem

The Convex adapter has a fundamental auth gap: `signIn()` returns `{ signingIn: true }` (no user/session), `onAuthChange()` is a no-op, and no session cookie is ever set. All e2e tests bypass this by intercepting `**/auth/session` and setting cookie directly.

## Root Cause

1. Convex auth client's `signIn()` returns `{ signingIn: true }` — not a session
2. Convex auth client has no `getUser()` — user info is in the JWT token
3. Convex auth client has no `onAuthStateChange` callback — only reactive hooks (`useConvexAuth`)
4. `onAuthChange()` is a no-op → no fallback sync after OAuth redirect

## Solution

Follow the same pattern as Firebase: `signIn()` returns user data → `handleSignIn` triggers sync. For OAuth, `onAuthChange` handles the sync after redirect.

### Changes

#### 1. `adapters/convex/src/adapter.js`

**Add JWT decode utility** (no crypto needed, just base64):

```js
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}
```

**Add `fetchSession()` helper**:

```js
async fetchSession() {
  if (!this.client?.isAuthenticated()) return null
  const token = await this.client.fetchAccessToken()
  if (!token) return null
  const payload = decodeJwtPayload(token)
  const user = {
    id: payload?.sub ?? '',
    email: payload?.email ?? '',
    role: payload?.role ?? 'user',
    user_metadata: payload?.user_metadata ?? {}
  }
  return { access_token: token, refresh_token: '', user, expires_in: 3600 }
}
```

**Update `signIn()`**: After `signIn()` completes, if `isAuthenticated()`, call `fetchSession()` and return session-like object:

```js
const data = await signInActions[mode]()
if (mode !== 'oauth' && mode !== 'magic' && this.client.isAuthenticated()) {
  const session = await this.fetchSession()
  if (session) {
    return { type: 'success', data: { user: session.user, session }, credentials }
  }
}
return transformResult({ data }, credentials)
```

**Implement `onAuthChange()`**: Check auth state on mount, sync if authenticated:

```js
onAuthChange(callback) {
  if (!this.client) return () => {}
  // Check auth state after current render cycle (handles OAuth redirect return)
  setTimeout(async () => {
    if (this.client.isAuthenticated()) {
      const session = await this.fetchSession()
      if (session) callback('SIGNED_IN', session)
    }
  }, 0)
  return () => {}
}
```

**Update `synchronize()`**: Handle both session objects and pass-through:

```js
synchronize(session) {
  if (session && typeof session === 'object' && 'user' in session) {
    return { data: { session }, error: null }
  }
  return { data: { session }, error: null }
}
```

#### 2. `adapters/convex/spec/adapter.spec.js`

Add tests for:

- `signIn()` returns session with user and access_token when authenticated
- `signIn()` returns current shape when not authenticated (OAuth)
- `onAuthChange()` calls callback with SIGNED_IN when authenticated on mount
- `fetchSession()` returns null when not authenticated
- `fetchSession()` returns session with decoded JWT user info

#### 3. `adapters/convex/spec/mock.js`

Update mock to return a valid JWT-like token for `fetchAccessToken()`.

#### 4. `adapters/convex/README.md`

Update notes:

- `onAuthChange` checks auth state on mount and syncs session (handles OAuth redirect)
- `signIn` returns session with user info for password flows

## Verification

1. Run Convex adapter unit tests: `bun run test:ci`
2. Run Convex e2e tests: `bun run test:e2e:convex`
3. Run full test suite: `bun run test:ci`
4. Lint check: `bunx eslint adapters/convex/`
