# Migration Guide: Plugin Architecture

## Overview

kavach now separates authentication from data access. The `AuthAdapter` no longer includes
`actions()` or `proxy()`. Data access is provided via a `DataAdapter` passed as an option
to `createKavach`.

## Breaking Changes

1. `AuthAdapter.actions()` removed — use `DataAdapter` instead
2. `AuthAdapter.proxy()` removed — use the SDK client directly
3. `getAdapter()` in `@kavach/adapter-supabase` now accepts a Supabase client instead of config

## Migration Steps

### Before (monolithic adapter)

```js
import { getAdapter } from '@kavach/adapter-supabase'

const adapter = getAdapter({ url, anonKey })
const kavach = createKavach(adapter, { invalidateAll })

// Data access via adapter
const actions = kavach.actions(schema)
const proxy = kavach.proxy(schema)
```

### After (auth + data plugin)

```js
import { createClient } from '@supabase/supabase-js'
import { getAdapter, getActions } from '@kavach/adapter-supabase'

const client = createClient(url, anonKey)
const adapter = getAdapter(client)
const data = (schema) => getActions(client, schema)
const kavach = createKavach(adapter, { data, invalidateAll })

// Data access via data option
const actions = kavach.actions(schema)

// Direct client access (replaces proxy)
const directAccess = client.schema('custom_schema')
```

### Key Differences

| Before | After |
|--------|-------|
| `getAdapter({ url, anonKey })` | `getAdapter(client)` |
| `kavach.proxy(schema)` | `client.schema(schema)` |
| `adapter.actions(schema)` | `getActions(client, schema)` |
| N/A | `createKavach(adapter, { data })` |

## New: Convex Adapter

The `@kavach/adapter-convex` package provides auth-only integration with Convex:

```js
import { getAdapter } from '@kavach/adapter-convex'

const adapter = getAdapter(convexAuth)
const kavach = createKavach(adapter, { invalidateAll })
```

Supported auth modes: password, OAuth, OTP/magic link.
