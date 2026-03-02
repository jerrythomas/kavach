# Plugin Architecture & Convex Adapter Design

## Goal

Separate auth from data in kavach's adapter architecture, then build a Convex auth adapter as the first adapter following the new pattern.

## Architecture

### Current: Monolithic Adapter

```
AuthAdapter = {
    signIn, signUp, signOut, synchronize, onAuthChange, parseUrlError,
    actions(schema),   // data — tightly coupled
    proxy(schema)      // supabase-specific
}
```

### New: Auth + Data Plugin

```
AuthAdapter = { signIn, signUp, signOut, synchronize, onAuthChange, parseUrlError }
DataAdapter = (schema?) => ServerActions

createKavach(authAdapter, { data: dataAdapter, invalidateAll, logger, page })
```

Both can share the same underlying SDK client for authenticated data access.

## DataAdapter Typedef

```js
/**
 * @typedef DataAdapter
 * @type {function(Schema): ServerActions}
 */
```

Same signature as the current `adapter.actions()` method.

## createKavach Changes

```js
// Before
createKavach(adapter, { invalidateAll, logger, page })
kavach.actions(schema)  // → adapter.actions(schema)

// After
createKavach(adapter, { data, invalidateAll, logger, page })
kavach.actions(schema)  // → options.data(schema)
```

## Supabase Adapter Refactor

**adapter.js**: Remove `actions` and `proxy` from return. Accept `client` instead of `{ url, anonKey }` (consumer creates the client).

**index.js**: Already exports `getActions` — no change needed.

**Consumer migration**:
```js
// Before
import { getAdapter } from '@kavach/adapter-supabase'
const adapter = getAdapter({ url, anonKey })
const kavach = createKavach(adapter, { invalidateAll })

// After
import { getAdapter, getActions } from '@kavach/adapter-supabase'
const client = createClient(url, anonKey)
const auth = getAdapter(client)
const data = (schema) => getActions(client, schema)
const kavach = createKavach(auth, { data, invalidateAll })
```

`proxy` is dropped — consumers use `client.schema()` directly.

## Convex Auth Adapter

**Package**: `@kavach/adapter-convex` at `adapters/convex/`

**Dependencies**: `@convex-dev/auth`, `convex`

**Auth modes**: password, OAuth, OTP/magic link (all four)

**Structure**:
```
adapters/convex/
├── src/
│   ├── adapter.js    # AuthAdapter implementation
│   ├── constants.js  # defaults
│   ├── types.js      # ConvexConfig typedef
│   └── index.js      # exports
├── spec/
│   ├── adapter.spec.js
│   └── mock.js
└── package.json
```

**Auth mode mapping**:
- password → Convex Password provider
- OAuth → Convex configured OAuth providers
- OTP/magic link → Convex email OTP flow

**`transformResult`** normalizes Convex responses to kavach's `AuthResult` format.

## Execution Order

1. Refactor types + `createKavach` to support `data` option
2. Refactor supabase adapter (remove actions/proxy from return)
3. Update supabase site consumer code
4. Build convex adapter (auth only)
5. Write migration doc
6. Final cleanup

## Testing

- Update kavach-browser/server mock adapter (remove actions/proxy)
- Update supabase adapter tests
- Supabase actions tests: no change (already independent)
- New convex adapter tests: mock convex client
- Add `createKavach` test for `data` option wiring
