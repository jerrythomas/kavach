import { expect, test } from '@playwright/test'

test.describe('Auth Page', () => {
	test('auth page loads correctly', async ({ page }) => {
		await page.goto('/auth')
		await expect(page.locator('header + div h1')).toContainText('Demo Authentication')
	})

	test('auth page has email password provider', async ({ page }) => {
		await page.goto('/auth')
		await expect(page.locator('input[type="email"]')).toBeVisible()
		await expect(page.locator('input[type="password"]')).toBeVisible()
	})

	test('auth page has oauth providers', async ({ page }) => {
		await page.goto('/auth')
		await expect(page.locator('button:has-text("Azure")')).toBeVisible()
		await expect(page.locator('button:has-text("Google")')).toBeVisible()
	})

	test('no console errors on auth page', async ({ page }) => {
		const errors: string[] = []
		page.on('console', msg => {
			if (msg.type() === 'error') {
				errors.push(msg.text())
			}
		})

		await page.goto('/auth')
		await page.waitForLoadState('networkidle')

		expect(errors.filter(e => !e.includes('hydration') && !e.includes('404'))).toHaveLength(0)
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

	test('demo admin page loads', async ({ page }) => {
		await page.goto('/demo/supabase/admin')
		await expect(page.getByRole('main').locator('h1')).toContainText('Admin Panel')
	})

	test('demo logout page loads', async ({ page }) => {
		await page.goto('/demo/supabase/logout')
		await expect(page.getByRole('main').locator('h1')).toContainText('Signing out')
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

test.describe('Demo - Role-Based Pages', () => {
	test('data page shows appropriate content for demo platform', async ({ page }) => {
		await page.goto('/demo/supabase/data')
		await expect(page.getByRole('main').locator('h1')).toContainText('Data Operations')
	})

	test('admin page shows admin interface', async ({ page }) => {
		await page.goto('/demo/supabase/admin')
		await expect(page.getByRole('main').locator('h1')).toContainText('Admin Panel')
	})
})

test.describe('Demo Navigation', () => {
	test('can navigate between demo pages', async ({ page }) => {
		await page.goto('/demo/supabase')
		
		// Navigate to data page
		await page.click('text=Data')
		await expect(page).toHaveURL(/\/demo\/supabase\/data/)
		
		// Navigate to admin page  
		await page.click('text=Admin')
		await expect(page).toHaveURL(/\/demo\/supabase\/admin/)
		
		// Navigate back to home
		await page.click('text=Home')
		await expect(page).toHaveURL(/\/demo\/supabase/)
	})
})
