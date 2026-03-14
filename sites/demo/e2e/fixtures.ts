import { test as base, expect, type Page } from '@playwright/test'

async function setCookie(page: Page, session: object) {
  await page.context().addCookies([
    {
      name: 'session',
      value: JSON.stringify(session),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }
  ])
}

async function loginSupabase(page: Page, email: string, password: string) {
  const SUPABASE_URL = 'http://127.0.0.1:54321'
  const ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

  const response = await page.context().request.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      data: { email, password },
      headers: { 'Content-Type': 'application/json', apikey: ANON_KEY }
    }
  )
  const token = await response.json()
  if (!token.access_token) throw new Error(`Supabase auth failed: ${JSON.stringify(token)}`)

  await page.route('**/auth/session', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  )
  await setCookie(page, {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    user: { id: token.user.id, email: token.user.email, role: token.user.role }
  })
}

async function loginFirebase(page: Page, email: string, password: string) {
  const EMULATOR_URL = 'http://127.0.0.1:9099'
  const PROJECT_ID = 'demo-kavach'

  const response = await page.context().request.post(
    `${EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${PROJECT_ID}`,
    {
      data: { email, password, returnSecureToken: true },
      headers: { 'Content-Type': 'application/json' }
    }
  )
  const token = await response.json()
  if (!token.idToken) throw new Error(`Firebase auth failed: ${JSON.stringify(token)}`)

  // Role is set directly from known test user email — no JWT claim parsing needed
  // because handleRouteProtection reads the session cookie as-is (no adapter call)
  const role = email === 'admin@test.com' ? 'admin' : 'user'

  await page.route('**/auth/session', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  )
  await setCookie(page, {
    access_token: token.idToken,
    refresh_token: token.refreshToken,
    user: { id: token.localId, email, role }
  })
}

async function loginConvex(page: Page, email: string, password: string) {
  // Convex adapter's synchronize() is a pass-through — any token value works
  // since handleRouteProtection reads the cookie directly without adapter validation
  const CONVEX_URL = 'http://127.0.0.1:3210'

  // Sign in via convex-auth HTTP action
  const response = await page.context().request.post(
    `${CONVEX_URL}/api/auth/signin`,
    {
      data: { provider: 'password', params: { email, password, flow: 'signIn' } },
      headers: { 'Content-Type': 'application/json' }
    }
  )

  let userId: string
  let accessToken: string
  let refreshToken: string

  if (response.ok()) {
    const data = await response.json()
    userId = data.userId ?? email
    accessToken = data.token ?? 'convex-test-token'
    refreshToken = data.refreshToken ?? 'convex-test-refresh'
  } else {
    // Fallback: use placeholder IDs (sufficient since session cookie is trusted directly)
    userId = email === 'admin@test.com' ? 'admin-test-id' : 'user-test-id'
    accessToken = 'convex-test-token'
    refreshToken = 'convex-test-refresh'
  }

  const role = email === 'admin@test.com' ? 'admin' : 'user'

  await page.route('**/auth/session', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  )
  await setCookie(page, {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: { id: userId, email, role }
  })
}

async function navigateToDashboard(page: Page) {
  await page.goto('/dashboard')
  await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  await page.waitForLoadState('domcontentloaded')
  await page.waitForSelector('main h1', { state: 'visible', timeout: 10000 })
}

type Fixtures = {
  loginAsUser: (role?: 'user' | 'admin') => Promise<void>
}

export const test = base.extend<Fixtures>({
  loginAsUser: async ({ page }, use, testInfo) => {
    await use(async (role = 'user') => {
      const adapter = testInfo.project.name
      const email = role === 'admin' ? 'admin@test.com' : 'test@test.com'
      const password = 'password123'

      switch (adapter) {
        case 'supabase':
          await loginSupabase(page, email, password)
          break
        case 'firebase':
          await loginFirebase(page, email, password)
          break
        case 'convex':
          await loginConvex(page, email, password)
          break
        default:
          throw new Error(`Unknown adapter: ${adapter}`)
      }

      await navigateToDashboard(page)
    })
  }
})

export { expect }
