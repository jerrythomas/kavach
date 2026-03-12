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
