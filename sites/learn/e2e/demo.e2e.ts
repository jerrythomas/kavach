import { expect, test } from '@playwright/test'

const SUPABASE_URL = 'http://127.0.0.1:54321'
const ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

async function loginAsUser(page, email = 'test@test.com', password = 'password123') {
	// Get token directly from Supabase (bypasses UI timing issues)
	const response = await page.context().request.post(
		`${SUPABASE_URL}/auth/v1/token?grant_type=password`,
		{
			data: { email, password },
			headers: { 'Content-Type': 'application/json', apikey: ANON_KEY }
		}
	)
	const token = await response.json()

	// Intercept the kavach session-sync endpoint so that when Supabase JS fires
	// SIGNED_OUT on init (no localStorage session), the server-side cookie is
	// NOT cleared.  We return a 200 so invalidateAll() runs the load functions
	// against the still-valid cookie we set below.
	await page.route('**/auth/session', (route) =>
		route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
	)

	// Set the kavach session cookie directly
	const session = {
		access_token: token.access_token,
		refresh_token: token.refresh_token,
		user: { id: token.user.id, role: token.user.role, email: token.user.email }
	}
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

	await page.goto('/demo/supabase/dashboard')
	await page.waitForURL(/\/demo\/supabase\/dashboard/, { timeout: 10000 })
	await page.waitForLoadState('domcontentloaded')
	await page.waitForSelector('main h1', { state: 'visible', timeout: 10000 })
}

test.describe('Auth Page', () => {
	test('auth page loads correctly', async ({ page }) => {
		await page.goto('/auth')
		await expect(page.locator('header + div h1')).toContainText('Demo Authentication')
	})

	test('auth page has email password provider', async ({ page }) => {
		await page.goto('/auth')
		await expect(page.locator('input[type="email"]').first()).toBeVisible()
		await expect(page.locator('input[type="password"]')).toBeVisible()
	})

	test('auth page has magic link and google providers', async ({ page }) => {
		await page.goto('/auth')
		await expect(page.locator('input[type="email"]').first()).toBeVisible()
		await expect(page.locator('button:has-text("Google")')).toBeVisible()
	})

	test('no console errors on auth page', async ({ page }) => {
		const errors: string[] = []
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text())
			}
		})

		await page.goto('/auth')
		await page.waitForLoadState('networkidle')

		expect(errors.filter((e) => !e.includes('hydration') && !e.includes('404'))).toHaveLength(0)
	})
})

test.describe('Demo - Unauthenticated Redirects', () => {
	test('demo landing page is public', async ({ page }) => {
		await page.goto('/demo/supabase')
		await expect(page).not.toHaveURL(/\/auth/)
		await expect(page).toHaveURL(/\/demo\/supabase$/)
	})

	test('demo dashboard redirects unauthenticated user to auth', async ({ page }) => {
		await page.goto('/demo/supabase/dashboard')
		await expect(page).toHaveURL(/\/auth/)
	})

	test('demo admin page redirects unauthenticated user to auth', async ({ page }) => {
		await page.goto('/demo/supabase/admin')
		await expect(page).toHaveURL(/\/auth/)
	})

	test('demo data page redirects unauthenticated user to auth', async ({ page }) => {
		await page.goto('/demo/supabase/data')
		await expect(page).toHaveURL(/\/auth/)
	})
})

test.describe('Demo Pages', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page)
	})

	test('demo dashboard page loads', async ({ page }) => {
		await expect(page.getByRole('main').locator('h1')).toContainText('Welcome back')
	})

	test('demo data page loads', async ({ page }) => {
		await page.goto('/demo/supabase/data')
		await expect(page.getByRole('main').locator('h1')).toContainText('Space Facts')
	})

	test('demo logout page redirects to auth', async ({ page }) => {
		// Unroute session intercept so the real signout can clear the server-side cookie
		await page.unroute('**/auth/session')
		await page.goto('/demo/supabase/logout')
		await expect(page).toHaveURL(/\/auth/)
	})
})

test.describe('Demo - Platform Variations', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page)
	})

	test('demo firebase platform loads', async ({ page }) => {
		await page.goto('/demo/firebase/dashboard')
		await expect(page.getByRole('main').locator('h1')).toContainText('Welcome back')
	})

	test('demo auth0 platform loads', async ({ page }) => {
		await page.goto('/demo/auth0/dashboard')
		await expect(page.getByRole('main').locator('h1')).toContainText('Welcome back')
	})

	test('demo amplify platform loads', async ({ page }) => {
		await page.goto('/demo/amplify/dashboard')
		await expect(page.getByRole('main').locator('h1')).toContainText('Welcome back')
	})

	test('demo convex platform loads', async ({ page }) => {
		await page.goto('/demo/convex/dashboard')
		await expect(page.getByRole('main').locator('h1')).toContainText('Welcome back')
	})
})

test.describe('Demo Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page)
	})

	test('can navigate between demo pages', async ({ page }) => {
		// Navigate to data page via nav link
		await page.locator('nav a[href="/demo/supabase/data"]').click()
		await page.waitForLoadState('domcontentloaded')
		await expect(page).toHaveURL(/\/demo\/supabase\/data/)

		// Navigate back to dashboard via nav link
		await page.getByRole('link', { name: 'Dashboard' }).click()
		await page.waitForLoadState('domcontentloaded')
		await expect(page).toHaveURL(/\/demo\/supabase\/dashboard/)
	})
})

test.describe('Demo - Data Page', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page)
	})

	test('data page has fetch controls', async ({ page }) => {
		await page.goto('/demo/supabase/data')
		await expect(page.locator('button:has-text("Load Facts")')).toBeVisible()
	})
})

test.describe('Demo Landing (public)', () => {
	test('demo landing page loads platform cards', async ({ page }) => {
		await page.goto('/demo')
		await expect(page.locator('h1')).toContainText('Kavach Demo')
		await expect(page.locator('a[href="/demo/supabase"]')).toBeVisible()
	})

	test('demo platform pre-auth page is public', async ({ page }) => {
		await page.goto('/demo/supabase')
		await expect(page).toHaveURL(/\/demo\/supabase$/)
		await expect(page.locator('h1')).toContainText('Supabase')
	})
})
