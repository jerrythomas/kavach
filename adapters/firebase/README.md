# @kavach/adapter-firebase

Kavach adapter for [Firebase Authentication](https://firebase.google.com/docs/auth).

## Installation

```bash
bun add kavach @kavach/adapter-firebase
```

## Usage

```js
import { getAdapter } from '@kavach/adapter-firebase'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const app = initializeApp({ apiKey: '...', authDomain: '...', projectId: '...' })
const auth = getAuth(app)

const adapter = getAdapter(auth)
```

## Auth modes

| Mode       | Mechanism                                |
| ---------- | ---------------------------------------- |
| OAuth      | `signInWithPopup` / `signInWithRedirect` |
| Password   | `signInWithEmailAndPassword`             |
| Magic link | `sendSignInLinkToEmail`                  |

## Capabilities

This adapter advertises `capabilities: ['passkey']` — passkey support is available via Firebase's WebAuthn integration.
