# Adapters

Module design for auth adapters — the integration layer between kavach and backend auth providers.

## Plugin Pattern

All adapters export `getAdapter(client)` accepting a pre-created SDK client and returning the `AuthAdapter` interface. The consumer creates and configures the SDK client externally. The adapter wraps it with kavach's auth contract.

**Exception:** Amplify v6 uses module-level global configuration — `getAdapter()` takes no arguments.

### AuthAdapter Interface

```js
{
  signIn,        // (credentials: AuthCredentials) => Promise<AuthResult>
  signUp,        // (credentials: PasswordCredentials) => Promise<AuthResult>
  signOut,       // () => Promise<void>
  synchronize,   // (session: AuthSession) => Promise<AuthResult>
  onAuthChange,  // (callback: AuthCallback) => void
  parseUrlError  // (url: Object) => AuthResult
}
```

### AuthResult

All SDK responses normalize to:
```js
{ data: { user, session }, error: null }   // success
{ data: null, error: { message, code } }   // failure
```

Each adapter implements a `transformResult` function mapping SDK-specific responses/errors to this shape.

### Auth Mode Routing

`signIn(credentials)` inspects credentials to determine the auth mode:

| Condition | Mode |
|-----------|------|
| `credentials.provider` | OAuth |
| `credentials.email && !credentials.password` | Magic link / OTP |
| `credentials.email && credentials.password` | Password |

## Supabase Adapter (reference)

**Status:** Complete. Plugin pattern, comprehensive tests.

**SDK:** `@supabase/supabase-js`

```js
import { createClient } from '@supabase/supabase-js'
import { getAdapter } from '@kavach/adapter-supabase'
const client = createClient(url, anonKey)
const adapter = getAdapter(client)
```

## Convex Adapter (reference)

**Status:** Complete. Plugin pattern, 15 tests.

**SDK:** `@convex-dev/auth` (convexAuth instance)

```js
import { getAdapter } from '@kavach/adapter-convex'
const adapter = getAdapter(convexAuth)
```

## Firebase Adapter

**SDK:** `firebase` v10 (modular, tree-shakeable). Replaces old `@firebase/app` + `@firebase/auth`.

**Consumer wiring:**
```js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAdapter } from '@kavach/adapter-firebase'

const app = initializeApp(config)
const auth = getAuth(app)
const adapter = getAdapter(auth)
```

**`getAdapter(auth)`** accepts a Firebase `Auth` instance. Imports modular functions:

```js
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, GithubAuthProvider,
  sendSignInLinkToEmail, signOut, onAuthStateChanged
} from 'firebase/auth'
```

**Auth modes:**

| Mode | SDK call |
|------|----------|
| Password | `signInWithEmailAndPassword(auth, email, password)` |
| OAuth | `signInWithPopup(auth, new Provider())` |
| Magic link | `sendSignInLinkToEmail(auth, email, settings)` |

**OAuth provider map:**
```js
const providers = { google: GoogleAuthProvider, github: GithubAuthProvider, ... }
```

**`synchronize`:** Returns current user state from `auth.currentUser`.

**`onAuthChange`:** `onAuthStateChanged(auth, callback)` — native support.

**`signUp`:** `createUserWithEmailAndPassword(auth, email, password)`

## Auth0 Adapter

**SDK:** `@auth0/auth0-spa-js` — current, no version upgrade needed.

**Consumer wiring:**
```js
import { createAuth0Client } from '@auth0/auth0-spa-js'
import { getAdapter } from '@kavach/adapter-auth0'

const auth0 = await createAuth0Client({ domain, clientId })
const adapter = getAdapter(auth0)  // synchronous
```

**`getAdapter(client)`** accepts an Auth0Client instance. Synchronous (async client creation is the consumer's responsibility).

**Auth modes:**

| Mode | SDK call |
|------|----------|
| Password | `client.loginWithRedirect({ authorizationParams: { connection: 'Username-Password-Authentication' } })` |
| OAuth | `client.loginWithRedirect({ authorizationParams: { connection: provider } })` |
| Magic link | `client.loginWithRedirect({ authorizationParams: { connection: 'email' } })` |

**Note:** Auth0 SPA SDK is redirect-based for all flows. `signIn` returns `{ data: null, error: null }` before redirect. Auth result comes back via callback handling.

**`signUp`:** `client.loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })`

**`synchronize`:** `client.getTokenSilently()` + `client.getUser()` to restore session.

**`onAuthChange`:** No-op — Auth0 SPA SDK has no native auth state listener.

**`parseUrlError`:** Parse `error` and `error_description` from URL query params.

## Amplify Adapter

**SDK:** `aws-amplify` v6 (modular imports from `aws-amplify/auth`). Replaces v5 style.

**Consumer wiring:**
```js
import { Amplify } from 'aws-amplify'
import { getAdapter } from '@kavach/adapter-amplify'

Amplify.configure({ Auth: { Cognito: { userPoolId, userPoolClientId } } })
const adapter = getAdapter()  // no client param — uses global config
```

**`getAdapter()`** — no client parameter. Amplify v6 uses module-level config. Imports modular functions:

```js
import {
  signIn, signUp, signOut, fetchAuthSession,
  signInWithRedirect
} from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
```

**Auth modes:**

| Mode | SDK call |
|------|----------|
| Password | `signIn({ username: email, password })` |
| OAuth | `signInWithRedirect({ provider })` |
| Magic link | `signIn({ username: email, options: { authFlowType: 'USER_AUTH' } })` |

**`synchronize`:** `fetchAuthSession()` to get current tokens/session.

**`onAuthChange`:** `Hub.listen('auth', callback)` — real event support in v6.

**`parseUrlError`:** Parse Cognito error codes from URL hash/query after OAuth redirect.

## Testing

Mock SDK client per adapter, verify correct SDK methods called with correct args.

**Structure:**
```
adapters/<name>/spec/
├── adapter.spec.js    # contract + auth mode tests
└── mock.js            # mock SDK client/module factory
```

**Coverage (~15-20 tests each):**
- Adapter shape — returns all 6 AuthAdapter methods
- `signIn` — password, OAuth, magic link modes
- `signUp` — creates account, returns AuthResult
- `signOut` — calls SDK signOut
- `synchronize` — returns session state
- `onAuthChange` — registers callback or no-op
- `parseUrlError` — extracts error from URL
- Error handling — SDK errors → `{ data: null, error }` AuthResult

## Deferred

- Phone OTP and anonymous auth (Firebase/Amplify)
- Integration tests with real backends/emulators
- Adapter capability detection (`adapter.supports('passkey')`)
