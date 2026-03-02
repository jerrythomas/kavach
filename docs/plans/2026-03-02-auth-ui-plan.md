# Auth UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add cached login cards, a smart auth page layout, and passkey adapter contract to kavach.

**Architecture:** New `loginCache` module in `packages/auth` manages localStorage. Three new Svelte components (`LoginCard`, `LoginCardList`, `AuthPage`) compose existing components. Passkey support added as a new auth mode with adapter capability declaration. Firebase adapter wired first.

**Tech Stack:** Svelte 5, Vitest, @testing-library/svelte, localStorage API

---

### Task 1: Login Cache Module

Add `loginCache.js` to `packages/auth` — a pure utility for managing cached login entries in localStorage. Browser-only (no-ops on server).

**Files:**
- Create: `solution/packages/auth/src/loginCache.js`
- Create: `solution/packages/auth/spec/loginCache.spec.js`
- Modify: `solution/packages/auth/src/index.js` (add export)

**Reference:** Read `solution/packages/auth/src/constants.js` for `RUNNING_ON` pattern.

**Step 1: Write tests**

```js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loginCache } from '../src/loginCache'

describe('loginCache', () => {
  let storage = {}

  beforeEach(() => {
    storage = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => storage[key] ?? null),
      setItem: vi.fn((key, val) => { storage[key] = val }),
      removeItem: vi.fn((key) => { delete storage[key] })
    })
  })

  const entry = (email, provider = 'google', overrides = {}) => ({
    email,
    name: email.split('@')[0],
    avatar: `https://gravatar.com/${email}`,
    provider,
    mode: 'oauth',
    hasPasskey: false,
    lastLogin: Date.now(),
    ...overrides
  })

  it('should return empty array when no cache exists', () => {
    expect(loginCache.get()).toEqual([])
  })

  it('should return empty array when cache is invalid JSON', () => {
    storage['kavach:logins'] = 'not-json'
    expect(loginCache.get()).toEqual([])
  })

  it('should store and retrieve a login entry', () => {
    const e = entry('a@b.com')
    loginCache.set(e)
    const result = loginCache.get()
    expect(result).toHaveLength(1)
    expect(result[0].email).toBe('a@b.com')
  })

  it('should upsert by email — update existing entry', () => {
    loginCache.set(entry('a@b.com', 'google', { lastLogin: 1000 }))
    loginCache.set(entry('a@b.com', 'azure', { lastLogin: 2000 }))
    const result = loginCache.get()
    expect(result).toHaveLength(1)
    expect(result[0].provider).toBe('azure')
    expect(result[0].lastLogin).toBe(2000)
  })

  it('should sort by lastLogin descending', () => {
    loginCache.set(entry('old@b.com', 'google', { lastLogin: 1000 }))
    loginCache.set(entry('new@b.com', 'azure', { lastLogin: 3000 }))
    loginCache.set(entry('mid@b.com', 'github', { lastLogin: 2000 }))
    const result = loginCache.get()
    expect(result.map((e) => e.email)).toEqual(['new@b.com', 'mid@b.com', 'old@b.com'])
  })

  it('should evict oldest when max 5 entries exceeded', () => {
    for (let i = 1; i <= 6; i++) {
      loginCache.set(entry(`user${i}@b.com`, 'google', { lastLogin: i * 1000 }))
    }
    const result = loginCache.get()
    expect(result).toHaveLength(5)
    expect(result.map((e) => e.email)).not.toContain('user1@b.com')
  })

  it('should remove a specific entry by email', () => {
    loginCache.set(entry('a@b.com'))
    loginCache.set(entry('b@b.com'))
    loginCache.remove('a@b.com')
    const result = loginCache.get()
    expect(result).toHaveLength(1)
    expect(result[0].email).toBe('b@b.com')
  })

  it('should clear all entries', () => {
    loginCache.set(entry('a@b.com'))
    loginCache.set(entry('b@b.com'))
    loginCache.clear()
    expect(loginCache.get()).toEqual([])
  })

  it('should no-op on server (no window)', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(loginCache.get()).toEqual([])
    expect(() => loginCache.set(entry('a@b.com'))).not.toThrow()
    expect(() => loginCache.remove('a@b.com')).not.toThrow()
    expect(() => loginCache.clear()).not.toThrow()
  })
})
```

**Step 2: Run tests — expect FAIL**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project auth spec/loginCache.spec.js
```

**Step 3: Implement**

```js
// solution/packages/auth/src/loginCache.js

const STORAGE_KEY = 'kavach:logins'
const MAX_ENTRIES = 5

function isAvailable() {
  return typeof localStorage !== 'undefined'
}

function read() {
  if (!isAvailable()) return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

function write(entries) {
  if (!isAvailable()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export const loginCache = {
  get() {
    return read().sort((a, b) => b.lastLogin - a.lastLogin)
  },

  set(entry) {
    if (!isAvailable()) return
    const entries = read().filter((e) => e.email !== entry.email)
    entries.push(entry)
    entries.sort((a, b) => b.lastLogin - a.lastLogin)
    write(entries.slice(0, MAX_ENTRIES))
  },

  remove(email) {
    if (!isAvailable()) return
    write(read().filter((e) => e.email !== email))
  },

  clear() {
    if (!isAvailable()) return
    localStorage.removeItem(STORAGE_KEY)
  }
}
```

**Step 4: Run tests — expect PASS**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project auth spec/loginCache.spec.js
```

**Step 5: Export from index**

Add to `solution/packages/auth/src/index.js`:

```js
export { loginCache } from './loginCache'
```

**Step 6: Run full auth test suite**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project auth
```

**Step 7: Commit**

```bash
git add solution/packages/auth/src/loginCache.js solution/packages/auth/spec/loginCache.spec.js solution/packages/auth/src/index.js
git commit -m "feat(auth): add loginCache module for cached login entries"
```

---

### Task 2: Wire Login Cache into Kavach Instance

Expose `getCachedLogins()`, `removeCachedLogin()`, `clearCachedLogins()` on the kavach instance. Auto-cache after successful `signIn` and `onAuthChange`.

**Files:**
- Modify: `solution/packages/auth/src/kavach.js`
- Modify: `solution/packages/auth/spec/kavach-browser.spec.js`

**Reference:** Read `solution/packages/auth/src/kavach.js` (the full `createKavach` function), `solution/packages/auth/spec/mock/adapter.js` (mock adapter shape).

**Step 1: Add tests to kavach-browser.spec.js**

Add a new `describe('login cache')` block:

```js
describe('login cache', () => {
  let storage = {}

  beforeEach(() => {
    storage = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => storage[key] ?? null),
      setItem: vi.fn((key, val) => { storage[key] = val }),
      removeItem: vi.fn((key) => { delete storage[key] })
    })
  })

  it('should expose cache methods on kavach instance', () => {
    const kavach = createKavach(adapter)
    expect(kavach.getCachedLogins).toEqual(expect.any(Function))
    expect(kavach.removeCachedLogin).toEqual(expect.any(Function))
    expect(kavach.clearCachedLogins).toEqual(expect.any(Function))
  })

  it('should cache login after successful signIn', async () => {
    adapter.signIn = vi.fn().mockResolvedValue({
      type: 'success',
      data: { user: { email: 'a@b.com', user_metadata: { full_name: 'A B', avatar_url: 'http://img' } } }
    })
    const kavach = createKavach(adapter, { invalidateAll })
    await kavach.signIn({ provider: 'google' })
    const cached = kavach.getCachedLogins()
    expect(cached).toHaveLength(1)
    expect(cached[0].email).toBe('a@b.com')
    expect(cached[0].provider).toBe('google')
  })

  it('should not cache login on error', async () => {
    adapter.signIn = vi.fn().mockResolvedValue({
      type: 'error',
      error: { message: 'fail' }
    })
    const kavach = createKavach(adapter, { invalidateAll })
    await kavach.signIn({ provider: 'google' })
    expect(kavach.getCachedLogins()).toHaveLength(0)
  })

  it('should remove a cached login', async () => {
    adapter.signIn = vi.fn().mockResolvedValue({
      type: 'success',
      data: { user: { email: 'a@b.com', user_metadata: {} } }
    })
    const kavach = createKavach(adapter, { invalidateAll })
    await kavach.signIn({ provider: 'google' })
    kavach.removeCachedLogin('a@b.com')
    expect(kavach.getCachedLogins()).toHaveLength(0)
  })

  it('should clear all cached logins', async () => {
    adapter.signIn = vi.fn().mockResolvedValue({
      type: 'success',
      data: { user: { email: 'a@b.com', user_metadata: {} } }
    })
    const kavach = createKavach(adapter, { invalidateAll })
    await kavach.signIn({ provider: 'google' })
    kavach.clearCachedLogins()
    expect(kavach.getCachedLogins()).toHaveLength(0)
  })
})
```

**Step 2: Run tests — expect FAIL**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project auth spec/kavach-browser.spec.js
```

**Step 3: Implement**

Modify `solution/packages/auth/src/kavach.js`:

1. Add import at top:
```js
import { loginCache } from './loginCache'
```

2. Add a helper function to extract cache entry from signIn result:
```js
function cacheLoginFromResult(result, credentials) {
  if (RUNNING_ON !== 'browser') return
  if (result.type !== 'success' || !result.data?.user) return

  const user = result.data.user
  const meta = user.user_metadata ?? {}

  loginCache.set({
    email: user.email,
    name: meta.full_name ?? user.email?.split('@')[0] ?? '',
    avatar: meta.avatar_url ?? '',
    provider: credentials.provider ?? 'email',
    mode: credentials.mode ?? (credentials.password ? 'password' : credentials.provider === 'magic' ? 'otp' : 'oauth'),
    hasPasskey: false,
    lastLogin: Date.now()
  })
}
```

3. Call `cacheLoginFromResult` at end of `handleSignIn`, after `authStatus.set(result)`:
```js
cacheLoginFromResult(result, credentials)
```

4. Add cache methods to the returned object in `createKavach`:
```js
return {
  signIn: (credentials) => handleSignIn(adapter, agents, credentials),
  signUp: (credentials) => handleSignUp(adapter, agents, credentials),
  signOut: () => handleSignOut(adapter, agents),
  onAuthChange: () => handleAuthChange(adapter, agents),
  handle: (request) => handleRouteProtection(adapter, agents, request),
  actions: (schema) => options.data?.(schema),
  getCachedLogins: () => loginCache.get(),
  removeCachedLogin: (email) => loginCache.remove(email),
  clearCachedLogins: () => loginCache.clear()
}
```

**Step 4: Run tests — expect PASS**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project auth spec/kavach-browser.spec.js
```

**Step 5: Update existing test**

The existing test `should create kavach using an adapter` asserts the shape of kavach. Update it to include the new methods:
```js
expect(kavach).toEqual({
  signIn: expect.any(Function),
  signUp: expect.any(Function),
  signOut: expect.any(Function),
  onAuthChange: expect.any(Function),
  handle: expect.any(Function),
  actions: expect.any(Function),
  getCachedLogins: expect.any(Function),
  removeCachedLogin: expect.any(Function),
  clearCachedLogins: expect.any(Function)
})
```

**Step 6: Run full auth suite**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project auth
```

**Step 7: Commit**

```bash
git add solution/packages/auth/src/kavach.js solution/packages/auth/spec/kavach-browser.spec.js
git commit -m "feat(auth): wire loginCache into kavach instance"
```

---

### Task 3: LoginCard Component

A single cached login entry card.

**Files:**
- Create: `solution/packages/ui/src/LoginCard.svelte`
- Create: `solution/packages/ui/spec/LoginCard.spec.svelte.js`

**Reference:** Read `solution/packages/ui/src/AuthButton.svelte` for component pattern, `solution/packages/ui/spec/AuthButton.spec.svelte.js` for test pattern.

**Step 1: Write tests**

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import LoginCard from '../src/LoginCard.svelte'

describe('LoginCard.svelte', () => {
  const props = {
    email: 'jerry@example.com',
    name: 'Jerry Thomas',
    avatar: 'https://gravatar.com/jerry',
    provider: 'google',
    mode: 'oauth',
    hasPasskey: false,
    onclick: vi.fn(),
    onremove: vi.fn()
  }

  beforeEach(() => {
    cleanup()
    props.onclick.mockClear()
    props.onremove.mockClear()
  })

  it('should render card with name, avatar, and provider badge', () => {
    const { container } = render(LoginCard, { props })
    expect(container.querySelector('img').getAttribute('src')).toBe(props.avatar)
    expect(container.textContent).toContain('Jerry Thomas')
    expect(container.querySelector('[data-provider]').dataset.provider).toBe('google')
  })

  it('should fire onclick with credentials when card is clicked', async () => {
    const { container } = render(LoginCard, { props })
    const card = container.querySelector('[data-login-card]')
    await fireEvent.click(card)
    expect(props.onclick).toHaveBeenCalledWith({
      email: 'jerry@example.com',
      provider: 'google',
      mode: 'oauth'
    })
  })

  it('should fire onremove with email when remove button clicked', async () => {
    const { container } = render(LoginCard, { props })
    const removeBtn = container.querySelector('[data-remove]')
    await fireEvent.click(removeBtn)
    expect(props.onremove).toHaveBeenCalledWith('jerry@example.com')
    expect(props.onclick).not.toHaveBeenCalled()
  })

  it('should show passkey icon when hasPasskey is true', () => {
    const { container } = render(LoginCard, {
      props: { ...props, hasPasskey: true }
    })
    expect(container.querySelector('[data-passkey]')).toBeTruthy()
  })

  it('should not show passkey icon when hasPasskey is false', () => {
    const { container } = render(LoginCard, { props })
    expect(container.querySelector('[data-passkey]')).toBeFalsy()
  })
})
```

**Step 2: Run tests — expect FAIL**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project ui spec/LoginCard.spec.svelte.js
```

**Step 3: Implement**

```svelte
<!-- solution/packages/ui/src/LoginCard.svelte -->
<script>
  let { email, name, avatar, provider, mode, hasPasskey = false, onclick, onremove } = $props()

  function handleClick() {
    onclick?.({ email, provider, mode })
  }

  function handleRemove(e) {
    e.stopPropagation()
    onremove?.(email)
  }
</script>

<login-card data-login-card class="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-neutral-100" onclick={handleClick} role="button" tabindex="0">
  <img src={avatar} alt={name} class="w-10 h-10 rounded-full" />
  <span class="flex flex-col flex-grow">
    <span class="font-medium">{name}</span>
  </span>
  <span data-provider={provider} class="i-auth-{provider}" aria-label={provider}></span>
  {#if hasPasskey}
    <span data-passkey class="i-auth-passkey" aria-label="passkey available"></span>
  {/if}
  <button data-remove type="button" onclick={handleRemove} aria-label="Remove login" class="ml-2 text-neutral-400 hover:text-neutral-700">&times;</button>
</login-card>
```

**Step 4: Run tests — expect PASS**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project ui spec/LoginCard.spec.svelte.js
```

**Step 5: Commit**

```bash
git add solution/packages/ui/src/LoginCard.svelte solution/packages/ui/spec/LoginCard.spec.svelte.js
git commit -m "feat(ui): add LoginCard component"
```

---

### Task 4: LoginCardList Component

Renders a list of LoginCard components. Empty state renders nothing.

**Files:**
- Create: `solution/packages/ui/src/LoginCardList.svelte`
- Create: `solution/packages/ui/spec/LoginCardList.spec.svelte.js`

**Step 1: Write tests**

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import LoginCardList from '../src/LoginCardList.svelte'

describe('LoginCardList.svelte', () => {
  const onclick = vi.fn()
  const onremove = vi.fn()

  const logins = [
    { email: 'a@b.com', name: 'A', avatar: 'http://a', provider: 'google', mode: 'oauth', hasPasskey: false, lastLogin: 2000 },
    { email: 'b@b.com', name: 'B', avatar: 'http://b', provider: 'azure', mode: 'oauth', hasPasskey: true, lastLogin: 1000 }
  ]

  beforeEach(() => {
    cleanup()
    onclick.mockClear()
    onremove.mockClear()
  })

  it('should render nothing when logins is empty', () => {
    const { container } = render(LoginCardList, { props: { logins: [], onclick, onremove } })
    expect(container.querySelector('login-card')).toBeFalsy()
  })

  it('should render a card for each login', () => {
    const { container } = render(LoginCardList, { props: { logins, onclick, onremove } })
    const cards = container.querySelectorAll('[data-login-card]')
    expect(cards).toHaveLength(2)
  })

  it('should pass onclick through to cards', async () => {
    const { container } = render(LoginCardList, { props: { logins, onclick, onremove } })
    const card = container.querySelector('[data-login-card]')
    await fireEvent.click(card)
    expect(onclick).toHaveBeenCalledWith({ email: 'a@b.com', provider: 'google', mode: 'oauth' })
  })

  it('should pass onremove through to cards', async () => {
    const { container } = render(LoginCardList, { props: { logins, onclick, onremove } })
    const removeBtn = container.querySelector('[data-remove]')
    await fireEvent.click(removeBtn)
    expect(onremove).toHaveBeenCalledWith('a@b.com')
  })
})
```

**Step 2: Run tests — expect FAIL**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project ui spec/LoginCardList.spec.svelte.js
```

**Step 3: Implement**

```svelte
<!-- solution/packages/ui/src/LoginCardList.svelte -->
<script>
  import LoginCard from './LoginCard.svelte'

  let { logins = [], onclick, onremove } = $props()
</script>

{#each logins as login (login.email)}
  <LoginCard {...login} {onclick} {onremove} />
{/each}
```

**Step 4: Run tests — expect PASS**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project ui spec/LoginCardList.spec.svelte.js
```

**Step 5: Commit**

```bash
git add solution/packages/ui/src/LoginCardList.svelte solution/packages/ui/spec/LoginCardList.spec.svelte.js
git commit -m "feat(ui): add LoginCardList component"
```

---

### Task 5: AuthPage Component

Smart layout orchestrator. Shows cached cards first (if any), then expandable "Other sign-in options" with provider groups.

**Files:**
- Create: `solution/packages/ui/src/AuthPage.svelte`
- Create: `solution/packages/ui/spec/AuthPage.spec.svelte.js`

**Reference:** Read `solution/packages/ui/src/AuthHandler.svelte` for similar pattern, `solution/packages/ui/spec/AuthHandler.spec.svelte.js` for test pattern with context.

**Step 1: Write tests**

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import AuthPage from '../src/AuthPage.svelte'

describe('AuthPage.svelte', () => {
  const providers = [
    { name: 'google', label: 'Sign in with Google' },
    { mode: 'otp', name: 'magic', label: 'Magic link' },
    { mode: 'password', name: 'email', label: 'Email' }
  ]

  beforeEach(() => {
    cleanup()
  })

  it('should render providers directly when no cached logins', () => {
    const kavach = {
      signIn: vi.fn().mockResolvedValue({ data: {} }),
      getCachedLogins: vi.fn().mockReturnValue([])
    }
    const { container } = render(AuthPage, {
      context: new Map([['kavach', kavach]]),
      props: { providers }
    })
    expect(container.querySelector('[data-login-card]')).toBeFalsy()
    expect(container.querySelector('button')).toBeTruthy()
  })

  it('should render cached login cards when logins exist', () => {
    const kavach = {
      signIn: vi.fn().mockResolvedValue({ data: {} }),
      getCachedLogins: vi.fn().mockReturnValue([
        { email: 'a@b.com', name: 'A', avatar: 'http://a', provider: 'google', mode: 'oauth', hasPasskey: false }
      ]),
      removeCachedLogin: vi.fn()
    }
    const { container } = render(AuthPage, {
      context: new Map([['kavach', kavach]]),
      props: { providers }
    })
    expect(container.querySelector('[data-login-card]')).toBeTruthy()
    expect(container.textContent).toContain('A')
  })

  it('should show other options section when cached logins exist', () => {
    const kavach = {
      signIn: vi.fn().mockResolvedValue({ data: {} }),
      getCachedLogins: vi.fn().mockReturnValue([
        { email: 'a@b.com', name: 'A', avatar: 'http://a', provider: 'google', mode: 'oauth', hasPasskey: false }
      ]),
      removeCachedLogin: vi.fn()
    }
    const { container } = render(AuthPage, {
      context: new Map([['kavach', kavach]]),
      props: { providers }
    })
    expect(container.querySelector('[data-other-options]')).toBeTruthy()
  })

  it('should re-authenticate when cached card is clicked', async () => {
    const kavach = {
      signIn: vi.fn().mockResolvedValue({ type: 'success', data: {} }),
      getCachedLogins: vi.fn().mockReturnValue([
        { email: 'a@b.com', name: 'A', avatar: 'http://a', provider: 'google', mode: 'oauth', hasPasskey: false }
      ]),
      removeCachedLogin: vi.fn()
    }
    const { container } = render(AuthPage, {
      context: new Map([['kavach', kavach]]),
      props: { providers }
    })
    const card = container.querySelector('[data-login-card]')
    await fireEvent.click(card)
    expect(kavach.signIn).toHaveBeenCalledWith({ provider: 'google', scopes: [] })
  })

  it('should remove cached login when remove is clicked', async () => {
    const kavach = {
      signIn: vi.fn().mockResolvedValue({ data: {} }),
      getCachedLogins: vi.fn().mockReturnValue([
        { email: 'a@b.com', name: 'A', avatar: 'http://a', provider: 'google', mode: 'oauth', hasPasskey: false }
      ]),
      removeCachedLogin: vi.fn()
    }
    const { container } = render(AuthPage, {
      context: new Map([['kavach', kavach]]),
      props: { providers }
    })
    const removeBtn = container.querySelector('[data-remove]')
    await fireEvent.click(removeBtn)
    expect(kavach.removeCachedLogin).toHaveBeenCalledWith('a@b.com')
  })
})
```

**Step 2: Run tests — expect FAIL**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project ui spec/AuthPage.spec.svelte.js
```

**Step 3: Implement**

```svelte
<!-- solution/packages/ui/src/AuthPage.svelte -->
<script>
  import { getContext } from 'svelte'
  import LoginCardList from './LoginCardList.svelte'
  import AuthProvider from './AuthProvider.svelte'
  import AuthError from './AuthError.svelte'
  import AuthResponse from './AuthResponse.svelte'

  const kavach = getContext('kavach')

  let { providers = [], onerror, onsuccess } = $props()

  let cachedLogins = $state(kavach.getCachedLogins?.() ?? [])
  let authStatus = $state({})
  let showOtherOptions = $state(false)

  function handleCardClick({ email, provider, mode }) {
    if (mode === 'oauth') {
      kavach.signIn({ provider, scopes: [] })
    } else if (mode === 'password') {
      showOtherOptions = true
    } else if (mode === 'otp') {
      kavach.signIn({ provider: 'magic', email })
    }
  }

  function handleRemove(email) {
    kavach.removeCachedLogin?.(email)
    cachedLogins = kavach.getCachedLogins?.() ?? []
  }

  $effect(() => {
    cachedLogins = kavach.getCachedLogins?.() ?? []
  })
</script>

<auth-page class="flex flex-col gap-4">
  {#if authStatus?.error}
    <AuthError {...authStatus.error} />
  {:else if authStatus?.message}
    <AuthResponse {...authStatus} />
  {/if}

  {#if cachedLogins.length > 0}
    <LoginCardList logins={cachedLogins} onclick={handleCardClick} onremove={handleRemove} />

    <details data-other-options>
      <summary class="cursor-pointer text-sm text-neutral-500">Other sign-in options</summary>
      <auth-providers class="flex flex-col gap-2 pt-2">
        {#each providers as data (data.name)}
          <AuthProvider {...data} />
        {/each}
      </auth-providers>
    </details>
  {:else}
    <auth-providers class="flex flex-col gap-2">
      {#each providers as data (data.name)}
        <AuthProvider {...data} />
      {/each}
    </auth-providers>
  {/if}
</auth-page>
```

**Step 4: Run tests — expect PASS**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project ui spec/AuthPage.spec.svelte.js
```

**Step 5: Commit**

```bash
git add solution/packages/ui/src/AuthPage.svelte solution/packages/ui/spec/AuthPage.spec.svelte.js
git commit -m "feat(ui): add AuthPage smart layout component"
```

---

### Task 6: Export New Components and Update Index Test

Add exports for the three new components and update the index test.

**Files:**
- Modify: `solution/packages/ui/src/index.js`
- Modify: `solution/packages/ui/spec/index.spec.js`

**Step 1: Read current index test**

Read `solution/packages/ui/spec/index.spec.js` to see current assertion.

**Step 2: Update exports**

Add to `solution/packages/ui/src/index.js`:
```js
export { default as LoginCard } from './LoginCard.svelte'
export { default as LoginCardList } from './LoginCardList.svelte'
export { default as AuthPage } from './AuthPage.svelte'
```

**Step 3: Update index test to verify 9 exports (was 6)**

**Step 4: Run full UI test suite**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project ui
```

**Step 5: Commit**

```bash
git add solution/packages/ui/src/index.js solution/packages/ui/spec/index.spec.js
git commit -m "feat(ui): export LoginCard, LoginCardList, AuthPage"
```

---

### Task 7: Adapter Capabilities and Passkey Contract

Add optional `capabilities` array to adapter interface. Update Firebase adapter to declare passkey capability and handle `mode: 'passkey'` in signIn.

**Files:**
- Modify: `solution/adapters/firebase/src/adapter.js`
- Modify: `solution/adapters/firebase/spec/adapter.spec.js`
- Modify: `solution/packages/auth/src/types.js` (update AuthAdapter typedef)

**Step 1: Add passkey tests to Firebase adapter**

Add to the signIn describe block in `solution/adapters/firebase/spec/adapter.spec.js`:

```js
describe('passkey', () => {
  it('should have passkey in capabilities', () => {
    expect(adapter.capabilities).toContain('passkey')
  })
})
```

And in the mock, add `signInWithPasskey` stub (Firebase SDK doesn't have a real passkey method yet — the adapter should handle this gracefully):

```js
it('should return error for passkey mode (not yet supported by Firebase SDK)', async () => {
  const result = await adapter.signIn({ mode: 'passkey', email: 'a@b.com' })
  expect(result.type).toBe('error')
  expect(result.error.message).toContain('not supported')
})
```

**Step 2: Run tests — expect FAIL**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project firebase
```

**Step 3: Implement**

In `solution/adapters/firebase/src/adapter.js`:

1. Update `getAuthMode` to recognize passkey:
```js
export function getAuthMode(credentials) {
  const { password, provider, mode } = credentials
  if (mode === 'passkey') return 'passkey'
  if (provider === 'magic') return 'magic'
  if (password) return 'password'
  return 'oauth'
}
```

2. Add passkey handler in `signInActions` inside `handleSignIn`:
```js
passkey: async () => {
  throw { code: 'auth/passkey-not-supported', message: 'Passkey authentication is not yet supported by this adapter' }
}
```

3. Add `capabilities` to the returned adapter object:
```js
return {
  signIn: handleSignIn,
  signUp: handleSignUp,
  signOut: handleSignOut,
  synchronize,
  onAuthChange,
  parseUrlError,
  capabilities: ['passkey']
}
```

4. Update `AuthAdapter` typedef in `solution/packages/auth/src/types.js` — add:
```js
 * @property {string[]} [capabilities]
```

**Step 4: Run tests — expect PASS**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run --project firebase
```

**Step 5: Run full suite**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run
```

**Step 6: Commit**

```bash
git add solution/adapters/firebase/src/adapter.js solution/adapters/firebase/spec/adapter.spec.js solution/packages/auth/src/types.js
git commit -m "feat(firebase): add passkey capability and auth mode contract"
```

---

### Task 8: Final Verification

Run the full test suite, verify all tests pass, no regressions.

**Step 1: Run full suite**

```bash
cd solution && NODE_OPTIONS='--disable-warning=DEP0040' npx vitest run
```

Expected: All tests pass (335 existing + new tests from tasks 1-7).

**Step 2: Verify no stale exports**

```bash
grep -r "loginCache\|LoginCard\|LoginCardList\|AuthPage\|capabilities\|getCachedLogins" solution/packages/auth/src/ solution/packages/ui/src/ solution/adapters/firebase/src/
```

**Step 3: Verify auth index exports loginCache**

```bash
grep "loginCache" solution/packages/auth/src/index.js
```

**Step 4: Verify UI index exports all 9 components**

```bash
grep "export" solution/packages/ui/src/index.js
```
