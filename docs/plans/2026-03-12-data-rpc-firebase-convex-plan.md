# Data + RPC Support: Firebase and Convex Adapters

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `getActions()` to the Firebase and Convex adapters, giving both adapters a consistent `{ get, put, post, patch, delete, call }` API that mirrors the existing Supabase pattern — so apps can switch backends with only a data migration and adapter swap.

**Architecture:** Firebase maps directly to Firestore CRUD (collections/documents) plus optional Callable Functions for `call`. Convex is function-based; CRUD maps by convention to `api.<entity>.list/create/upsert/update/remove`, and `call` maps to any Convex action. Both normalize responses to `ActionResponse` shape via `@kavach/query` parsing.

**Tech Stack:** `firebase/firestore`, `firebase/functions`, `convex` (client + api), `@kavach/query` (parseFilter, parseQueryParams), `vitest`

---

## Key design decisions

### Firebase (`adapters/firebase/src/actions.ts`)

- `getActions(db, functions?)` — Firestore `db` required; `functions` instance optional (only needed for `call`)
- Firestore operator mapping from kavach PostgREST operators:
  - `eq` → `==`, `neq` → `!=`, `gt` → `>`, `gte` → `>=`, `lt` → `<`, `lte` → `<=`
  - `in` → `in` (value is comma-separated list like Supabase: `in.(a,b,c)`)
  - `is` → `==` (handles `null`)
  - `like`/`ilike` → unsupported, throw descriptive error
- `put` uses `addDoc` (Firestore auto-generates ID); returns `{ id, ...data }`
- `post` uses `setDoc` with `{ merge: true }` (upsert); requires `data.id`
- `patch` / `delete` require `filter: { id: 'eq.<docId>' }` — Firestore needs a document reference. Throw if not provided.
- `call` uses `httpsCallable(functions, entity)(data)`; throws if `functions` not provided

### Convex (`adapters/convex/src/actions.js`)

- `getActions(client, api)` — both required
- Convention: entity is a dot-path into the `api` object (e.g., `'users'` → `api.users`)
  - `get('users', params)` → `client.query(api.users.list, { filters, orders, limit, offset })`
  - `put('users', data)` → `client.mutation(api.users.create, data)`
  - `post('users', data)` → `client.mutation(api.users.upsert, data)`
  - `patch('users', input)` → `client.mutation(api.users.update, input)` (input has `{ data, filter }`)
  - `delete('users', input)` → `client.mutation(api.users.remove, input)`
  - `call(path, data)` → `client.action(resolvedRef, data)` where path can be `'myAction'` or `'users.report'`
- Throws a descriptive error if the expected function is not in the api object (guides backend setup)
- Passes `filters/orders/limit/offset` as-is to query functions — the Convex backend is responsible for applying them

---

## File structure

| Path                                     | Action | Purpose                                |
| ---------------------------------------- | ------ | -------------------------------------- |
| `adapters/firebase/src/actions.ts`       | Create | Firestore CRUD + callable functions    |
| `adapters/firebase/spec/actions.spec.ts` | Create | Tests for firebase actions             |
| `adapters/firebase/src/index.ts`         | Modify | Export `getActions`                    |
| `adapters/firebase/src/capabilities.js`  | Modify | Set `data: true, rpc: true`            |
| `adapters/firebase/README.md`            | Modify | Document data/rpc usage                |
| `adapters/convex/src/actions.js`         | Create | Convention-based Convex CRUD + actions |
| `adapters/convex/spec/actions.spec.js`   | Create | Tests for convex actions               |
| `adapters/convex/src/index.js`           | Modify | Export `getActions`                    |
| `adapters/convex/src/capabilities.js`    | Modify | Set `data: true, rpc: true`            |
| `adapters/convex/README.md`              | Modify | Document data/rpc convention           |

---

## Task 1: Firebase `getActions`

**Files:**

- Create: `adapters/firebase/src/actions.ts`
- Create: `adapters/firebase/spec/actions.spec.ts`
- Modify: `adapters/firebase/src/index.ts`
- Modify: `adapters/firebase/src/capabilities.js`
- Modify: `adapters/firebase/README.md`

### Step 1.1: Write the failing tests

- [ ] Create `adapters/firebase/spec/actions.spec.ts` with this content:

```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { getActions } from '../src/actions'

// Firebase SDK mocks — mirror the real module shape
vi.mock('firebase/firestore', () => {
  const mockDocs = [
    { id: 'doc1', data: () => ({ name: 'Alice', status: 'active' }) },
    { id: 'doc2', data: () => ({ name: 'Bob', status: 'active' }) }
  ]
  const mockSnapshot = { docs: mockDocs }

  const mockQuery = vi.fn().mockResolvedValue(mockSnapshot)
  const where = vi.fn().mockReturnValue({ _type: 'where' })
  const orderBy = vi.fn().mockReturnValue({ _type: 'orderBy' })
  const limit = vi.fn().mockReturnValue({ _type: 'limit' })
  const collection = vi.fn().mockReturnValue({ _type: 'collection' })
  const query = vi.fn().mockResolvedValue(mockSnapshot)
  const getDocs = vi.fn().mockResolvedValue(mockSnapshot)
  const addDoc = vi.fn().mockResolvedValue({ id: 'new-id' })
  const setDoc = vi.fn().mockResolvedValue(undefined)
  const updateDoc = vi.fn().mockResolvedValue(undefined)
  const deleteDoc = vi.fn().mockResolvedValue(undefined)
  const doc = vi.fn().mockReturnValue({ _type: 'docRef', id: 'doc1' })

  return {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc
  }
})

vi.mock('firebase/functions', () => {
  const result = { data: { ok: true } }
  const callableFn = vi.fn().mockResolvedValue(result)
  const httpsCallable = vi.fn().mockReturnValue(callableFn)
  return { httpsCallable }
})

describe('getActions (firebase)', async () => {
  const {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc
  } = await import('firebase/firestore')
  const { httpsCallable } = await import('firebase/functions')

  const db = { _type: 'firestore' }
  const functions = { _type: 'functions' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return an object with all action methods', () => {
    const actions = getActions(db)
    expect(actions).toEqual({
      get: expect.any(Function),
      put: expect.any(Function),
      post: expect.any(Function),
      patch: expect.any(Function),
      delete: expect.any(Function),
      call: expect.any(Function),
      connection: db
    })
  })

  describe('get', () => {
    it('should query collection without filters', async () => {
      const actions = getActions(db)
      const response = await actions.get('users')
      expect(collection).toHaveBeenCalledWith(db, 'users')
      expect(getDocs).toHaveBeenCalled()
      expect(response.data).toEqual([
        { id: 'doc1', name: 'Alice', status: 'active' },
        { id: 'doc2', name: 'Bob', status: 'active' }
      ])
      expect(response.status).toBe(200)
      expect(response.error).toBeNull()
    })

    it('should apply eq filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { status: 'eq.active' } })
      expect(where).toHaveBeenCalledWith('status', '==', 'active')
    })

    it('should apply gt filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { age: 'gt.18' } })
      expect(where).toHaveBeenCalledWith('age', '>', '18')
    })

    it('should apply gte filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { age: 'gte.18' } })
      expect(where).toHaveBeenCalledWith('age', '>=', '18')
    })

    it('should apply lt filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { age: 'lt.65' } })
      expect(where).toHaveBeenCalledWith('age', '<', '65')
    })

    it('should apply lte filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { age: 'lte.65' } })
      expect(where).toHaveBeenCalledWith('age', '<=', '65')
    })

    it('should apply neq filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { status: 'neq.deleted' } })
      expect(where).toHaveBeenCalledWith('status', '!=', 'deleted')
    })

    it('should apply in filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { role: 'in.(admin,editor)' } })
      expect(where).toHaveBeenCalledWith('role', 'in', ['admin', 'editor'])
    })

    it('should apply is.null filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { deleted_at: 'is.null' } })
      expect(where).toHaveBeenCalledWith('deleted_at', '==', null)
    })

    it('should apply orderBy', async () => {
      const actions = getActions(db)
      await actions.get('users', { order: 'name.asc' })
      expect(orderBy).toHaveBeenCalledWith('name', 'asc')
    })

    it('should apply orderBy descending', async () => {
      const actions = getActions(db)
      await actions.get('users', { order: 'created_at.desc' })
      expect(orderBy).toHaveBeenCalledWith('created_at', 'desc')
    })

    it('should apply limit', async () => {
      const actions = getActions(db)
      await actions.get('users', { limit: 10 })
      expect(limit).toHaveBeenCalledWith(10)
    })

    it('should throw on unsupported like operator', async () => {
      const actions = getActions(db)
      await expect(actions.get('users', { filter: { name: 'like.%Alice%' } })).rejects.toThrow(
        'Firestore does not support the "like" operator'
      )
    })
  })

  describe('put', () => {
    it('should insert a new document', async () => {
      const actions = getActions(db)
      const response = await actions.put('users', { name: 'Carol' })
      expect(collection).toHaveBeenCalledWith(db, 'users')
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), { name: 'Carol' })
      expect(response.data).toEqual({ id: 'new-id', name: 'Carol' })
      expect(response.status).toBe(200)
    })
  })

  describe('post', () => {
    it('should upsert a document by id', async () => {
      const actions = getActions(db)
      const response = await actions.post('users', { id: 'user-1', name: 'Carol' })
      expect(doc).toHaveBeenCalledWith(db, 'users', 'user-1')
      expect(setDoc).toHaveBeenCalledWith(expect.anything(), { name: 'Carol' }, { merge: true })
      expect(response.data).toEqual({ id: 'user-1', name: 'Carol' })
      expect(response.status).toBe(200)
    })

    it('should throw if id is missing', async () => {
      const actions = getActions(db)
      await expect(actions.post('users', { name: 'Carol' })).rejects.toThrow(
        'post (upsert) requires an id field'
      )
    })
  })

  describe('patch', () => {
    it('should update a document by id filter', async () => {
      const actions = getActions(db)
      const response = await actions.patch('users', {
        data: { name: 'Updated' },
        filter: { id: 'eq.doc1' }
      })
      expect(doc).toHaveBeenCalledWith(db, 'users', 'doc1')
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { name: 'Updated' })
      expect(response.data).toEqual({ id: 'doc1', name: 'Updated' })
      expect(response.status).toBe(200)
    })

    it('should throw if id filter is missing', async () => {
      const actions = getActions(db)
      await expect(actions.patch('users', { data: { name: 'x' } })).rejects.toThrow(
        'patch requires filter.id eq.<docId>'
      )
    })
  })

  describe('delete', () => {
    it('should delete a document by id filter', async () => {
      const actions = getActions(db)
      const response = await actions.delete('users', { filter: { id: 'eq.doc1' } })
      expect(doc).toHaveBeenCalledWith(db, 'users', 'doc1')
      expect(deleteDoc).toHaveBeenCalledWith(expect.anything())
      expect(response.status).toBe(200)
    })

    it('should throw if id filter is missing', async () => {
      const actions = getActions(db)
      await expect(actions.delete('users')).rejects.toThrow('delete requires filter.id eq.<docId>')
    })
  })

  describe('call', () => {
    it('should call a Firebase Callable Function', async () => {
      const actions = getActions(db, functions)
      const response = await actions.call('sendWelcomeEmail', { userId: 'u1' })
      expect(httpsCallable).toHaveBeenCalledWith(functions, 'sendWelcomeEmail')
      expect(response.data).toEqual({ ok: true })
      expect(response.status).toBe(200)
    })

    it('should throw if functions client is not provided', async () => {
      const actions = getActions(db)
      await expect(actions.call('sendWelcomeEmail', {})).rejects.toThrow(
        'call requires a Firebase Functions instance'
      )
    })
  })
})
```

### Step 1.2: Run tests to verify they fail

- [ ] Run:
  ```bash
  bun vitest run --project firebase
  ```
  Expected: FAIL — `getActions is not a function` or import error

### Step 1.3: Implement `adapters/firebase/src/actions.ts`

- [ ] Create `adapters/firebase/src/actions.ts`:

```typescript
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  limit as firestoreLimit,
  type QueryConstraint
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { parseFilter, parseQueryParams } from '@kavach/query'
import type { ActionResponse } from 'kavach'

// Maps kavach PostgREST-style operators to Firestore operators
const FIRESTORE_OP: Record<string, string> = {
  eq: '==',
  neq: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  in: 'in',
  is: '=='
}

const UNSUPPORTED_OPS = new Set([
  'like',
  'ilike',
  'cs',
  'cd',
  'ov',
  'sl',
  'sr',
  'nxr',
  'nxl',
  'adj'
])

function normalizeResponse(data: unknown, error: unknown = null): ActionResponse {
  return {
    data: data ?? null,
    error: error ?? null,
    status: error ? 500 : 200
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getActions(db: any, functions?: any) {
  async function get(entity: string, data?: Record<string, unknown>): Promise<ActionResponse> {
    const { filters, orders, limit } = parseQueryParams(data as Record<string, string>)
    const constraints: QueryConstraint[] = []

    for (const { column, op, value } of filters) {
      if (UNSUPPORTED_OPS.has(op)) {
        throw new Error(
          `Firestore does not support the "${op}" operator. Use eq, neq, gt, gte, lt, lte, in, or is.`
        )
      }
      const firestoreOp = FIRESTORE_OP[op]
      if (firestoreOp) {
        // Parse 'in' operator: value like '(a,b,c)' → ['a','b','c']
        if (op === 'in') {
          const arr = (value as string)
            .replace(/^\(|\)$/g, '')
            .split(',')
            .map((v) => v.trim())
          constraints.push(where(column, 'in', arr))
        } else {
          // 'is.null' → null; otherwise use value as-is
          const actualValue = op === 'is' && value === 'null' ? null : value
          constraints.push(
            where(column, firestoreOp as '==' | '!=' | '>' | '>=' | '<' | '<=', actualValue)
          )
        }
      }
    }

    for (const { column, ascending } of orders) {
      constraints.push(orderBy(column, ascending ? 'asc' : 'desc'))
    }

    if (limit !== undefined) {
      constraints.push(firestoreLimit(limit))
    }

    const q = query(collection(db, entity), ...constraints)
    const snapshot = await getDocs(q)
    const docs = snapshot.docs.map((d: { id: string; data: () => Record<string, unknown> }) => ({
      id: d.id,
      ...d.data()
    }))
    return normalizeResponse(docs)
  }

  async function put(entity: string, data: Record<string, unknown>): Promise<ActionResponse> {
    const ref = await addDoc(collection(db, entity), data)
    return normalizeResponse({ id: ref.id, ...data })
  }

  async function post(entity: string, data: Record<string, unknown>): Promise<ActionResponse> {
    const { id, ...rest } = data as { id?: string } & Record<string, unknown>
    if (!id) throw new Error('post (upsert) requires an id field')
    const docRef = doc(db, entity, id)
    await setDoc(docRef, rest, { merge: true })
    return normalizeResponse({ id, ...rest })
  }

  async function patch(
    entity: string,
    input?: { data?: Record<string, unknown>; filter?: Record<string, string> }
  ): Promise<ActionResponse> {
    const { data = {}, filter = {} } = input ?? {}
    const filters = parseFilter(filter)
    const idFilter = filters.find((f) => f.column === 'id' && f.op === 'eq')
    if (!idFilter)
      throw new Error('patch requires filter.id eq.<docId> — Firestore needs a document reference')
    const docRef = doc(db, entity, idFilter.value as string)
    await updateDoc(docRef, data)
    return normalizeResponse({ id: idFilter.value, ...data })
  }

  async function del(
    entity: string,
    input?: { filter?: Record<string, string> }
  ): Promise<ActionResponse> {
    const { filter = {} } = input ?? {}
    const filters = parseFilter(filter)
    const idFilter = filters.find((f) => f.column === 'id' && f.op === 'eq')
    if (!idFilter)
      throw new Error('delete requires filter.id eq.<docId> — Firestore needs a document reference')
    const docRef = doc(db, entity, idFilter.value as string)
    await deleteDoc(docRef)
    return normalizeResponse({ id: idFilter.value })
  }

  async function call(entity: string, data: Record<string, unknown>): Promise<ActionResponse> {
    if (!functions) {
      throw new Error(
        'call requires a Firebase Functions instance — pass it as the second argument to getActions(db, functions)'
      )
    }
    const fn = httpsCallable(functions, entity)
    const result = await fn(data)
    return normalizeResponse(result.data)
  }

  return { get, put, post, patch, delete: del, call, connection: db }
}
```

### Step 1.4: Run tests to verify they pass

- [ ] Run:
  ```bash
  bun vitest run --project firebase
  ```
  Expected: All tests pass (including existing adapter tests + new actions tests)

### Step 1.5: Update `index.ts` and `capabilities.js`

- [ ] Edit `adapters/firebase/src/index.ts`:

```typescript
export { getAdapter, transformResult } from './adapter'
export { getActions } from './actions'
```

- [ ] Edit `adapters/firebase/src/capabilities.js`:

```js
export const capabilities = {
  name: 'firebase',
  displayName: 'Firebase',
  supports: {
    data: true,
    rpc: true,
    logging: false,
    magic: true,
    oauth: true,
    password: true,
    passkey: true
  }
}
```

### Step 1.6: Update the Firebase README

- [ ] Edit `adapters/firebase/README.md` — add a Data & RPC section after Auth modes:

````markdown
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
````

### Supported filter operators

| Kavach operator | Firestore operator |
| --------------- | ------------------ |
| `eq`            | `==`               |
| `neq`           | `!=`               |
| `gt`            | `>`                |
| `gte`           | `>=`               |
| `lt`            | `<`                |
| `lte`           | `<=`               |
| `in`            | `in`               |
| `is`            | `==` (null checks) |

> `like`, `ilike`, and array operators are not supported by Firestore. Use `eq.in` for multi-value filters.

### `patch` and `delete` require an `id` filter

Firestore operates on document references, not row-level queries. Both `patch` and `delete` require `filter: { id: 'eq.<docId>' }` to locate the document.

## RPC (Callable Cloud Functions)

Pass a `functions` instance as the second argument to `getActions()`. Then use `call(functionName, data)`:

```js
const actions = getActions(db, functions)
await actions.call('myCloudFunction', { input: 'value' })
```

Set up Callable Functions in your Firebase backend: [Firebase Callable Functions docs](https://firebase.google.com/docs/functions/callable).

````

### Step 1.7: Run all tests and verify clean build

- [ ] Run:
  ```bash
  bun vitest run --project firebase
````

Expected: All tests pass

- [ ] Run build:
  ```bash
  cd adapters/firebase && bun run build
  ```
  Expected: No TypeScript errors, `dist/` updated

### Step 1.8: Commit

- [ ] Commit:
  ```bash
  git add adapters/firebase/src/actions.ts adapters/firebase/spec/actions.spec.ts \
    adapters/firebase/src/index.ts adapters/firebase/src/capabilities.js adapters/firebase/README.md
  git commit -m "feat(firebase): add getActions — Firestore CRUD + callable function RPC"
  ```

---

## Task 2: Convex `getActions`

**Files:**

- Create: `adapters/convex/src/actions.js`
- Create: `adapters/convex/spec/actions.spec.js`
- Modify: `adapters/convex/src/index.js`
- Modify: `adapters/convex/src/capabilities.js`
- Modify: `adapters/convex/README.md`

### Background: Convex is function-based

Convex has no direct table/collection query API on the client. All data access goes through named functions defined in the Convex backend (`convex/` directory). The convention this adapter enforces:

| Kavach method           | Convex convention                            | Type     |
| ----------------------- | -------------------------------------------- | -------- |
| `get(entity, params)`   | `api.<entity>.list(params)`                  | query    |
| `put(entity, data)`     | `api.<entity>.create(data)`                  | mutation |
| `post(entity, data)`    | `api.<entity>.upsert(data)`                  | mutation |
| `patch(entity, input)`  | `api.<entity>.update(input)`                 | mutation |
| `delete(entity, input)` | `api.<entity>.remove(input)`                 | mutation |
| `call(path, data)`      | `api.<path>(data)` resolved via dot notation | action   |

The `params` passed to `get` are `{ filters, orders, limit, offset }` from `parseQueryParams` — your Convex `list` function receives them and applies filtering server-side. This keeps query logic in the backend where access control (Convex auth rules) can be enforced.

### Step 2.1: Write the failing tests

- [ ] Create `adapters/convex/spec/actions.spec.js`:

```js
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { getActions } from '../src/actions'

describe('getActions (convex)', () => {
  const queryResult = [{ _id: 'id1', name: 'Alice' }]
  const mutationResult = { _id: 'id1', name: 'Alice' }
  const actionResult = { sent: true }

  function createClient() {
    return {
      query: vi.fn().mockResolvedValue(queryResult),
      mutation: vi.fn().mockResolvedValue(mutationResult),
      action: vi.fn().mockResolvedValue(actionResult)
    }
  }

  function createApi() {
    const listFn = { _type: 'query', _path: 'users:list' }
    const createFn = { _type: 'mutation', _path: 'users:create' }
    const upsertFn = { _type: 'mutation', _path: 'users:upsert' }
    const updateFn = { _type: 'mutation', _path: 'users:update' }
    const removeFn = { _type: 'mutation', _path: 'users:remove' }
    const sendWelcomeFn = { _type: 'action', _path: 'actions:sendWelcome' }

    return {
      users: {
        list: listFn,
        create: createFn,
        upsert: upsertFn,
        update: updateFn,
        remove: removeFn
      },
      actions: {
        sendWelcome: sendWelcomeFn
      }
    }
  }

  let client, api

  beforeEach(() => {
    client = createClient()
    api = createApi()
  })

  it('should return an object with all action methods', () => {
    const actions = getActions(client, api)
    expect(actions).toEqual({
      get: expect.any(Function),
      put: expect.any(Function),
      post: expect.any(Function),
      patch: expect.any(Function),
      delete: expect.any(Function),
      call: expect.any(Function),
      connection: client
    })
  })

  it('should throw if client is not provided', () => {
    expect(() => getActions(null, api)).toThrow('getActions requires a Convex client')
  })

  it('should throw if api is not provided', () => {
    expect(() => getActions(client, null)).toThrow('getActions requires a Convex api reference')
  })

  describe('get', () => {
    it('should call api.users.list via client.query', async () => {
      const actions = getActions(client, api)
      const response = await actions.get('users')
      expect(client.query).toHaveBeenCalledWith(api.users.list, {
        filters: [],
        orders: [],
        limit: undefined,
        offset: undefined
      })
      expect(response.data).toEqual(queryResult)
      expect(response.status).toBe(200)
      expect(response.error).toBeNull()
    })

    it('should pass parsed filters and orders to query', async () => {
      const actions = getActions(client, api)
      await actions.get('users', { filter: { status: 'eq.active' }, order: 'name.asc', limit: 10 })
      expect(client.query).toHaveBeenCalledWith(api.users.list, {
        filters: [{ column: 'status', op: 'eq', value: 'active' }],
        orders: [{ column: 'name', ascending: true }],
        limit: 10,
        offset: undefined
      })
    })

    it('should throw a descriptive error if api.users.list is missing', async () => {
      const actions = getActions(client, {})
      await expect(actions.get('users')).rejects.toThrow('No Convex query found at api.users.list')
    })
  })

  describe('put', () => {
    it('should call api.users.create via client.mutation', async () => {
      const actions = getActions(client, api)
      const response = await actions.put('users', { name: 'Carol' })
      expect(client.mutation).toHaveBeenCalledWith(api.users.create, { name: 'Carol' })
      expect(response.data).toEqual(mutationResult)
      expect(response.status).toBe(200)
    })

    it('should throw if api.users.create is missing', async () => {
      const actions = getActions(client, {})
      await expect(actions.put('users', { name: 'x' })).rejects.toThrow(
        'No Convex mutation found at api.users.create'
      )
    })
  })

  describe('post', () => {
    it('should call api.users.upsert via client.mutation', async () => {
      const actions = getActions(client, api)
      const response = await actions.post('users', { _id: 'id1', name: 'Carol' })
      expect(client.mutation).toHaveBeenCalledWith(api.users.upsert, { _id: 'id1', name: 'Carol' })
      expect(response.data).toEqual(mutationResult)
      expect(response.status).toBe(200)
    })
  })

  describe('patch', () => {
    it('should call api.users.update via client.mutation', async () => {
      const actions = getActions(client, api)
      const input = { data: { name: 'Updated' }, filter: { _id: 'eq.id1' } }
      const response = await actions.patch('users', input)
      expect(client.mutation).toHaveBeenCalledWith(api.users.update, input)
      expect(response.data).toEqual(mutationResult)
      expect(response.status).toBe(200)
    })
  })

  describe('delete', () => {
    it('should call api.users.remove via client.mutation', async () => {
      const actions = getActions(client, api)
      const input = { filter: { _id: 'eq.id1' } }
      const response = await actions.delete('users', input)
      expect(client.mutation).toHaveBeenCalledWith(api.users.remove, input)
      expect(response.data).toEqual(mutationResult)
      expect(response.status).toBe(200)
    })
  })

  describe('call', () => {
    it('should call a Convex action via dot-path', async () => {
      const actions = getActions(client, api)
      const response = await actions.call('actions.sendWelcome', { userId: 'u1' })
      expect(client.action).toHaveBeenCalledWith(api.actions.sendWelcome, { userId: 'u1' })
      expect(response.data).toEqual(actionResult)
      expect(response.status).toBe(200)
    })

    it('should throw if the path cannot be resolved', async () => {
      const actions = getActions(client, api)
      await expect(actions.call('actions.missing', {})).rejects.toThrow(
        'No Convex function found at api.actions.missing'
      )
    })
  })

  describe('error handling', () => {
    it('should return error response when query throws', async () => {
      client.query = vi.fn().mockRejectedValue(new Error('Query failed'))
      const actions = getActions(client, api)
      const response = await actions.get('users')
      expect(response.status).toBe(500)
      expect(response.error).toEqual({ message: 'Query failed' })
      expect(response.data).toBeNull()
    })

    it('should return error response when mutation throws', async () => {
      client.mutation = vi.fn().mockRejectedValue(new Error('Mutation failed'))
      const actions = getActions(client, api)
      const response = await actions.put('users', { name: 'x' })
      expect(response.status).toBe(500)
      expect(response.error).toEqual({ message: 'Mutation failed' })
      expect(response.data).toBeNull()
    })
  })
})
```

### Step 2.2: Run tests to verify they fail

- [ ] Run:
  ```bash
  bun vitest run --project convex
  ```
  Expected: FAIL — import error for `getActions`

### Step 2.3: Implement `adapters/convex/src/actions.js`

- [ ] Create `adapters/convex/src/actions.js`:

```js
import { parseQueryParams } from '@kavach/query'

/**
 * Normalize to ActionResponse
 * @param {unknown} data
 * @param {unknown} [error]
 * @returns {{ data: unknown, error: unknown, status: number }}
 */
function normalizeResponse(data, error = null) {
  return {
    data: data ?? null,
    error: error ?? null,
    status: error ? 500 : 200
  }
}

/**
 * Resolve a dot-path like 'users.list' into a Convex function reference
 * from the api object (e.g., api.users.list).
 *
 * @param {object} api
 * @param {string} path - dot-separated path
 * @returns {unknown}
 */
function resolvePath(api, path) {
  return path.split('.').reduce((obj, key) => obj?.[key], api)
}

/**
 * Create data/RPC actions for a Convex backend.
 *
 * Convex is function-based; all data access goes through named functions.
 * This adapter uses a convention:
 *   get('entity', params) → client.query(api.entity.list, parsedParams)
 *   put('entity', data)   → client.mutation(api.entity.create, data)
 *   post('entity', data)  → client.mutation(api.entity.upsert, data)
 *   patch('entity', input)  → client.mutation(api.entity.update, input)
 *   delete('entity', input) → client.mutation(api.entity.remove, input)
 *   call('path', data)    → client.action(api.<path>, data)
 *
 * Your Convex backend must define the corresponding functions.
 * See the README for the expected function signatures.
 *
 * @param {object} client - ConvexReactClient or ConvexHttpClient
 * @param {object} api    - Convex generated API reference (from 'convex/_generated/api')
 * @returns {{ get, put, post, patch, delete, call, connection }}
 */
export function getActions(client, api) {
  if (!client) throw new Error('getActions requires a Convex client')
  if (!api) throw new Error('getActions requires a Convex api reference')

  async function get(entity, data) {
    const ref = resolvePath(api, `${entity}.list`)
    if (!ref)
      throw new Error(
        `No Convex query found at api.${entity}.list — define it in your Convex backend`
      )
    const { filters, orders, limit, offset } = parseQueryParams(data)
    try {
      const result = await client.query(ref, { filters, orders, limit, offset })
      return normalizeResponse(result)
    } catch (error) {
      return normalizeResponse(null, { message: error.message })
    }
  }

  async function put(entity, data) {
    const ref = resolvePath(api, `${entity}.create`)
    if (!ref)
      throw new Error(
        `No Convex mutation found at api.${entity}.create — define it in your Convex backend`
      )
    try {
      const result = await client.mutation(ref, data)
      return normalizeResponse(result)
    } catch (error) {
      return normalizeResponse(null, { message: error.message })
    }
  }

  async function post(entity, data) {
    const ref = resolvePath(api, `${entity}.upsert`)
    if (!ref)
      throw new Error(
        `No Convex mutation found at api.${entity}.upsert — define it in your Convex backend`
      )
    try {
      const result = await client.mutation(ref, data)
      return normalizeResponse(result)
    } catch (error) {
      return normalizeResponse(null, { message: error.message })
    }
  }

  async function patch(entity, input = {}) {
    const ref = resolvePath(api, `${entity}.update`)
    if (!ref)
      throw new Error(
        `No Convex mutation found at api.${entity}.update — define it in your Convex backend`
      )
    try {
      const result = await client.mutation(ref, input)
      return normalizeResponse(result)
    } catch (error) {
      return normalizeResponse(null, { message: error.message })
    }
  }

  async function del(entity, input = {}) {
    const ref = resolvePath(api, `${entity}.remove`)
    if (!ref)
      throw new Error(
        `No Convex mutation found at api.${entity}.remove — define it in your Convex backend`
      )
    try {
      const result = await client.mutation(ref, input)
      return normalizeResponse(result)
    } catch (error) {
      return normalizeResponse(null, { message: error.message })
    }
  }

  async function call(path, data) {
    const ref = resolvePath(api, path)
    if (!ref)
      throw new Error(`No Convex function found at api.${path} — define it in your Convex backend`)
    try {
      const result = await client.action(ref, data)
      return normalizeResponse(result)
    } catch (error) {
      return normalizeResponse(null, { message: error.message })
    }
  }

  return { get, put, post, patch, delete: del, call, connection: client }
}
```

### Step 2.4: Run tests to verify they pass

- [ ] Run:
  ```bash
  bun vitest run --project convex
  ```
  Expected: All tests pass (including existing auth tests)

### Step 2.5: Update `index.js` and `capabilities.js`

- [ ] Edit `adapters/convex/src/index.js`:

```js
// skipcq: JS-E1004 - Needed for exposing JS Doc types
export * from './types'
export { getAdapter } from './adapter'
export { getActions } from './actions'
```

- [ ] Edit `adapters/convex/src/capabilities.js`:

```js
export const capabilities = {
  name: 'convex',
  displayName: 'Convex',
  supports: {
    data: true,
    rpc: true,
    logging: false,
    magic: false,
    oauth: true,
    password: true,
    passkey: false
  }
}
```

### Step 2.6: Update the Convex README

- [ ] Edit `adapters/convex/README.md` — add a Data & RPC section after Notes:

````markdown
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
````

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
    // Apply filters, ordering, and pagination as needed
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
    // Extract _id from filter and patch
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

````

### Step 2.7: Run all tests and verify

- [ ] Run:
  ```bash
  bun vitest run --project convex
````

Expected: All tests pass

### Step 2.8: Run the full test suite

- [ ] Run:
  ```bash
  bun vitest run
  ```
  Expected: All tests pass across all projects

### Step 2.9: Commit

- [ ] Commit:
  ```bash
  git add adapters/convex/src/actions.js adapters/convex/spec/actions.spec.js \
    adapters/convex/src/index.js adapters/convex/src/capabilities.js adapters/convex/README.md
  git commit -m "feat(convex): add getActions — convention-based CRUD + action RPC"
  ```
