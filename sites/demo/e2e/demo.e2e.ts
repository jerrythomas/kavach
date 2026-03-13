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

	await page.goto('/dashboard')
	await page.waitForURL(/\/dashboard/, { timeout: 10000 })
	await page.waitForLoadState('domcontentloaded')
	await page.waitForSelector('main h1', { state: 'visible', timeout: 10000 })
}

test.describe('Landing page', () => {
	test('shows adapter name and sign in link', async ({ page }) => {
		await page.goto('/')
		await expect(page.locator('h1')).toContainText('Authentication')
		await expect(page.locator('a[href="/auth"]')).toBeVisible()
	})
})

test.describe('Auth page', () => {
	test('auth page loads and shows sign in form', async ({ page }) => {
		await page.goto('/auth')
		await expect(page.locator('input[type="email"]')).toBeVisible()
		await expect(page.locator('input[type="password"]')).toBeVisible()
	})

	test('unauthenticated user redirected from dashboard to auth', async ({ page }) => {
		await page.goto('/dashboard')
		await expect(page).toHaveURL(/\/auth/)
	})

	test('unauthenticated user redirected from admin to auth', async ({ page }) => {
		await page.goto('/admin')
		await expect(page).toHaveURL(/\/auth/)
	})

	test('unauthenticated user redirected from data to auth', async ({ page }) => {
		await page.goto('/data')
		await expect(page).toHaveURL(/\/auth/)
	})
})

test.describe('Authenticated user', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsUser(page)
	})

	test('dashboard shows welcome and user email', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('Welcome back')
		await expect(page.locator('main')).toContainText('test@test.com')
	})

	test('data page loads and shows Load Facts button', async ({ page }) => {
		await page.goto('/data')
		await expect(page.locator('h1')).toContainText('Space Facts')
		await expect(page.locator('button:has-text("Load Facts")')).toBeVisible()
	})

	test('data page loads facts after clicking Load Facts', async ({ page }) => {
		await page.goto('/data')
		await page.click('button:has-text("Load Facts")')
		await page.waitForSelector('.rounded-lg.border.p-4', { state: 'visible', timeout: 5000 })
		const facts = page.locator('.rounded-lg.border.p-4')
		await expect(facts).toHaveCount(5) // general facts only for non-admin
	})

	test('admin page redirects non-admin to dashboard', async ({ page }) => {
		await page.goto('/admin')
		await expect(page).toHaveURL(/\/dashboard/)
	})

	test('logout signs out and redirects to landing', async ({ page }) => {
		// Unroute session intercept so the real signout can clear the server-side cookie
		await page.unroute('**/auth/session')
		await page.goto('/logout')
		await expect(page).toHaveURL(/\/$/, { timeout: 5000 })
	})
})

test.describe('Admin user', () => {
	test.beforeEach(async ({ page }) => {
		// admin user must exist in local Supabase with role='admin'
		await loginAsUser(page, 'admin@test.com', 'password123')
	})

	test('admin page shows session info with admin role', async ({ page }) => {
		await page.goto('/admin')
		await expect(page.locator('h1')).toContainText('Admin Panel')
		await expect(page.locator('dd:has-text("admin")')).toBeVisible()
	})

	test('data page shows classified facts for admin', async ({ page }) => {
		await page.goto('/data')
		await page.click('button:has-text("Load Facts")')
		await page.waitForSelector('.rounded-lg.border.p-4', { state: 'visible', timeout: 5000 })
		const facts = page.locator('.rounded-lg.border.p-4')
		await expect(facts).toHaveCount(8) // all 8 facts for admin
	})

	test('data page shows CLASSIFIED badge for admin facts', async ({ page }) => {
		await page.goto('/data')
		await page.click('button:has-text("Load Facts")')
		await page.waitForSelector('text=CLASSIFIED', { state: 'visible', timeout: 5000 })
		const classifiedBadges = page.locator('text=CLASSIFIED')
		// 3 classified facts for admin
		await expect(classifiedBadges).toHaveCount(3)
	})
})
