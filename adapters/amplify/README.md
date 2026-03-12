# @kavach/adapter-amplify

Kavach adapter for [AWS Amplify](https://docs.amplify.aws) / Cognito.

## Installation

```bash
bun add kavach @kavach/adapter-amplify
```

## Usage

```js
import { Amplify } from 'aws-amplify'
import { getAdapter } from '@kavach/adapter-amplify'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'YOUR_USER_POOL_ID',
      userPoolClientId: 'YOUR_APP_CLIENT_ID',
      loginWith: {
        oauth: {
          domain: 'YOUR_COGNITO_DOMAIN',
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: ['http://localhost:5173'],
          redirectSignOut: ['http://localhost:5173'],
          responseType: 'code'
        }
      }
    }
  }
})

const adapter = getAdapter()
```

## Auth modes

| Mode       | Mechanism                      |
| ---------- | ------------------------------ |
| OAuth      | `signInWithRedirect`           |
| Password   | `signIn` with email + password |
| Magic link | `signIn` with `USER_AUTH` flow |

## Notes

Auth state changes are broadcast via Amplify's `Hub`. The adapter listens on the `auth` channel and normalizes `signedIn`/`signedOut` events to the Kavach `AuthCallback` contract.
