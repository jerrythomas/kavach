import { expect, test } from './fixtures.js'

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
	})

	test('unauthenticated user redirected from dashboard to auth', async ({ page }) => {
		await page.goto('/dashboard')
		await expect(page).toHaveURL(/\/auth/)
	})

	test('unauthenticated user redirected from admin to auth', async ({ page }) => {
		await page.goto('/admin')
		await expect(page).toHaveURL(/\/auth/)
	})
})

test.describe('Authenticated user', () => {
	test.beforeEach(async ({ loginAsUser }) => {
		await loginAsUser('user')
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
	test.beforeEach(async ({ loginAsUser }) => {
		await loginAsUser('admin')
	})

	test('admin page shows session info with admin role', async ({ page }) => {
		await page.goto('/admin')
		await expect(page.locator('h1')).toContainText('Admin Panel')
		await expect(page.locator('dd').filter({ hasText: /^admin$/ })).toBeVisible()
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
