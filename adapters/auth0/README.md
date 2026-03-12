# @kavach/adapter-auth0

Kavach adapter for [Auth0](https://auth0.com).

## Installation

```bash
bun add kavach @kavach/adapter-auth0
```

## Usage

```js
import { getAdapter } from '@kavach/adapter-auth0'
import { createAuth0Client } from '@auth0/auth0-spa-js'

const client = await createAuth0Client({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin
  }
})

const adapter = getAdapter(client)
```

## Auth modes

| Mode       | Mechanism                                                   |
| ---------- | ----------------------------------------------------------- |
| OAuth      | `loginWithRedirect` via social connection                   |
| Password   | `loginWithRedirect` with `Username-Password-Authentication` |
| Magic link | `loginWithRedirect` with `email` connection                 |

## Notes

- `onAuthChange` is a no-op — Auth0 SPA SDK doesn't expose a subscription API. Handle redirects via `parseUrlError` and `synchronize` after the callback.
- `synchronize` calls `getTokenSilently` + `getUser` to refresh the session.
