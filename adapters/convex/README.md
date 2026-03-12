# @kavach/adapter-convex

Kavach adapter for [Convex](https://convex.dev).

## Installation

```bash
bun add kavach @kavach/adapter-convex
```

## Usage

```js
import { getAdapter } from '@kavach/adapter-convex'
import { useConvexAuth } from 'convex/react'

const convexAuth = useConvexAuth()
const adapter = getAdapter(convexAuth)
```

## Auth modes

| Mode       | Mechanism                                  |
| ---------- | ------------------------------------------ |
| Password   | Convex `password` flow (email + password)  |
| Magic link | Convex `resend-otp` flow                   |
| OAuth      | Redirect via `convexAuth.signIn(provider)` |

## Notes

- **`onAuthChange`** is a no-op. Use Convex's own reactivity (e.g. `useConvexAuth`) to respond to auth state changes.
- **`synchronize`** returns the current session as-is without server round-trip.

## Data access

Convex is function-based — all data access goes through named functions you define in your `convex/` directory. `getActions` wraps this with a consistent API by convention.

Pass your Convex client and the generated `api` reference:

```js
import { getActions } from '@kavach/adapter-convex'
import { ConvexReactClient } from 'convex/react'
import { api } from '../convex/_generated/api'

const client = new ConvexReactClient(CONVEX_URL)
const actions = getActions(client, api)

// Read — calls api.users.list({ filters, orders, limit, offset })
const { data } = await actions.get('users', {
  filter: { status: 'eq.active' },
  order: 'name.asc',
  limit: 20
})

// Insert — calls api.users.create(data)
await actions.put('users', { name: 'Alice', role: 'editor' })

// Upsert — calls api.users.upsert(data)
await actions.post('users', { _id: 'j57abc', name: 'Alice' })

// Update — calls api.users.update({ data, filter })
await actions.patch('users', { data: { role: 'admin' }, filter: { _id: 'eq.j57abc' } })

// Delete — calls api.users.remove({ filter })
await actions.delete('users', { filter: { _id: 'eq.j57abc' } })

// Call a Convex action — calls api.actions.sendWelcome(data)
await actions.call('actions.sendWelcome', { userId: 'j57abc' })
```

### Required Convex backend functions

Your `convex/` directory must define functions following this convention for each entity:

```ts
// convex/users.ts
import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {
    filters: v.optional(v.array(v.object({ column: v.string(), op: v.string(), value: v.any() }))),
    orders: v.optional(v.array(v.object({ column: v.string(), ascending: v.boolean() }))),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, { filters = [], orders = [], limit, offset }) => {
    // TODO: Apply filters, orders, limit, and offset from args for proper query support.
    // Until then, this returns all documents (suitable for small collections).
    return await ctx.db.query('users').collect()
  }
})

export const create = mutation({
  args: { name: v.string(), role: v.optional(v.string()) },
  handler: async (ctx, data) => ctx.db.insert('users', data)
})

export const upsert = mutation({
  args: { _id: v.id('users'), name: v.string(), role: v.optional(v.string()) },
  handler: async (ctx, { _id, ...data }) => {
    await ctx.db.replace(_id, data)
    return { _id, ...data }
  }
})

export const update = mutation({
  args: { data: v.object({ role: v.optional(v.string()) }), filter: v.optional(v.any()) },
  handler: async (ctx, { data, filter }) => {
    const id = filter?._id?.replace('eq.', '')
    await ctx.db.patch(id, data)
    return { _id: id, ...data }
  }
})

export const remove = mutation({
  args: { filter: v.optional(v.any()) },
  handler: async (ctx, { filter }) => {
    const id = filter?._id?.replace('eq.', '')
    await ctx.db.delete(id)
    return { _id: id }
  }
})
```

> **Portability note:** By following this convention, switching from Convex to another backend (Supabase, Firebase) only requires a data migration and swapping `getActions` — your app code stays unchanged.
