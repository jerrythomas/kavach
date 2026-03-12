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

## Data access

Pass your Firestore `db` instance (and optionally a `functions` instance for RPC calls):

```js
import { getActions } from '@kavach/adapter-firebase'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const db = getFirestore(app)
const functions = getFunctions(app)

const actions = getActions(db, functions)

// Read
const { data } = await actions.get('users', {
  filter: { status: 'eq.active' },
  order: 'name.asc',
  limit: 20
})

// Insert (Firestore generates the ID)
await actions.put('users', { name: 'Alice', role: 'editor' })

// Upsert by ID
await actions.post('users', { id: 'user-1', name: 'Alice' })

// Update (requires id filter)
await actions.patch('users', { data: { role: 'admin' }, filter: { id: 'eq.user-1' } })

// Delete (requires id filter)
await actions.delete('users', { filter: { id: 'eq.user-1' } })

// Call a Callable Cloud Function
await actions.call('sendWelcomeEmail', { userId: 'user-1' })
```

### Supported filter operators

| Kavach operator | Firestore operator       |
| --------------- | ------------------------ |
| `eq`            | `==`                     |
| `neq`           | `!=`                     |
| `gt`            | `>`                      |
| `gte`           | `>=`                     |
| `lt`            | `<`                      |
| `lte`           | `<=`                     |
| `in`            | `in`                     |
| `is`            | `==` (null, true, false) |

> `like`, `ilike`, and array operators are not supported by Firestore.

### `patch` and `delete` require an `id` filter

Firestore operates on document references, not row-level queries. Both `patch` and `delete` require `filter: { id: 'eq.<docId>' }` to locate the document.

## RPC (Callable Cloud Functions)

Pass a `functions` instance as the second argument to `getActions()`:

```js
const actions = getActions(db, functions)
await actions.call('myCloudFunction', { input: 'value' })
```
