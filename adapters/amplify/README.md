# @kavach/adapter-amplify

Kavach adapter for [AWS Amplify](https://docs.amplify.aws) v6 / Cognito.

## Installation

```bash
bun add kavach @kavach/adapter-amplify
```

## Usage

Configure Amplify once at app startup, then create the adapter:

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

## AWS Cognito setup

### 1. Create a User Pool

In the [AWS Console](https://console.aws.amazon.com/cognito):

1. Go to **Cognito → User pools → Create user pool**
2. Choose sign-in options (email recommended)
3. Under **App client**, create a **Public client** (no client secret)
4. Note your **User Pool ID** and **App client ID**

### 2. Configure the App Client

In your User Pool → **App clients**:

- Enable **ALLOW_USER_SRP_AUTH** (password sign-in)
- Enable **ALLOW_REFRESH_TOKEN_AUTH**
- Add your app URLs to **Allowed callback URLs** and **Allowed sign-out URLs**

### 3. OAuth / Social providers (optional)

To use `signInWithRedirect` (Google, GitHub, etc.):

1. Set up a **Cognito domain** under **App integration → Domain**
2. Add social identity providers under **Sign-in experience → Federated identity provider sign-in**
3. Configure each provider's client ID/secret from their developer console
4. Enable **Authorization code grant** and the required **OAuth scopes** (`email`, `openid`, `profile`)

### 4. Magic link / Passwordless (optional)

Magic link uses Cognito's **passwordless** `USER_AUTH` flow, which requires:

1. Under **Sign-in experience**, enable **Passwordless sign-in**
2. Enable **Email one-time passwords** as an auth factor
3. Ensure your app client has **ALLOW_USER_AUTH** enabled

> Standard Cognito User Pools created before 2024 may not have passwordless available. If you don't need magic link, no action required.

## Auth modes

| Mode       | Mechanism                                   | Cognito requirement          |
| ---------- | ------------------------------------------- | ---------------------------- |
| Password   | `signIn` with email + password (SRP)        | `ALLOW_USER_SRP_AUTH`        |
| OAuth      | `signInWithRedirect` via Cognito Hosted UI  | Cognito domain + provider    |
| Magic link | `signIn` with `USER_AUTH` passwordless flow | Passwordless feature enabled |

## Notes

- Auth state changes are broadcast via Amplify's `Hub`. The adapter listens on the `auth` channel and normalizes `signedIn`/`signedOut` events to the Kavach `AuthCallback` contract.
- The adapter uses module-level Amplify functions — no client instance is needed. Configure Amplify before calling `getAdapter()`.
