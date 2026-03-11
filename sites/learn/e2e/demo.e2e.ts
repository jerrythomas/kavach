import { expect, test } from '@playwright/test'

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

test.describe('Demo Pages', () => {
	test('demo index page loads', async ({ page }) => {
		await page.goto('/demo/supabase')
		await expect(page.getByRole('main').locator('h1')).toContainText('Welcome to Kavach Demo')
	})

	test('demo data page loads', async ({ page }) => {
		await page.goto('/demo/supabase/data')
		await expect(page.getByRole('main').locator('h1')).toContainText('Data Operations')
	})

	test('demo admin page redirects unauthenticated user', async ({ page }) => {
		await page.goto('/demo/supabase/admin')
		await expect(page).toHaveURL(/\/demo\/supabase$/)
	})

	test('demo logout page redirects to auth', async ({ page }) => {
		await page.goto('/demo/supabase/logout')
		await expect(page).toHaveURL(/\/auth/)
	})
})

test.describe('Demo - Platform Variations', () => {
	test('demo firebase platform loads', async ({ page }) => {
		await page.goto('/demo/firebase')
		await expect(page.getByRole('main').locator('h1')).toContainText('Welcome to Kavach Demo')
	})

	test('demo auth0 platform loads', async ({ page }) => {
		await page.goto('/demo/auth0')
		await expect(page.getByRole('main').locator('h1')).toContainText('Welcome to Kavach Demo')
	})

	test('demo amplify platform loads', async ({ page }) => {
		await page.goto('/demo/amplify')
		await expect(page.getByRole('main').locator('h1')).toContainText('Welcome to Kavach Demo')
	})

	test('demo convex platform loads', async ({ page }) => {
		await page.goto('/demo/convex')
		await expect(page.getByRole('main').locator('h1')).toContainText('Welcome to Kavach Demo')
	})
})

test.describe('Demo Navigation', () => {
	test('can navigate between demo pages', async ({ page }) => {
		await page.goto('/demo/supabase')

		// Navigate to data page
		await page.click('text=Data')
		await expect(page).toHaveURL(/\/demo\/supabase\/data/)

		// Navigate to dashboard
		await page.click('text=Dashboard')
		await expect(page).toHaveURL(/\/demo\/supabase$/)
	})

	test('platform switcher changes platform', async ({ page }) => {
		await page.goto('/demo/supabase')
		await page.selectOption('select', 'firebase')
		await expect(page).toHaveURL(/\/demo\/firebase/)
	})
})

test.describe('Demo - Data Page', () => {
	test('data page has fetch controls', async ({ page }) => {
		await page.goto('/demo/supabase/data')
		await expect(page.getByRole('main').locator('select')).toBeVisible()
		await expect(page.locator('button:has-text("Fetch")')).toBeVisible()
	})
})
