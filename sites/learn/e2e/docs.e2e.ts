import { expect, test } from '@playwright/test'

test.describe('Docs Pages', () => {
	test('docs index page loads', async ({ page }) => {
		await page.goto('/docs')
		await expect(page.getByRole('main').locator('h1')).toContainText('Kavach Documentation')
	})

	test('docs layout has sidebar with navigation', async ({ page }) => {
		await page.goto('/docs')
		const aside = page.locator('aside')
		await expect(aside).toBeVisible()
	})

	test('can navigate to quick-start from docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Quick Start')
		await expect(page).toHaveURL(/\/docs\/quick-start/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Quick Start')
	})

	test('can navigate to configuration', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Configuration')
		await expect(page).toHaveURL(/\/docs\/configuration/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Configuration')
	})
})

test.describe('Docs - Adapter Pages', () => {
	test('supabase adapter docs page loads', async ({ page }) => {
		await page.goto('/docs/adapters/supabase')
		await expect(page.getByRole('main').locator('h1')).toContainText('Supabase')
	})

	test('firebase adapter docs page loads', async ({ page }) => {
		await page.goto('/docs/adapters/firebase')
		await expect(page.getByRole('main').locator('h1')).toContainText('Firebase')
	})

	test('auth0 adapter docs page loads', async ({ page }) => {
		await page.goto('/docs/adapters/auth0')
		await expect(page.getByRole('main').locator('h1')).toContainText('Auth0')
	})

	test('amplify adapter docs page loads', async ({ page }) => {
		await page.goto('/docs/adapters/amplify')
		await expect(page.getByRole('main').locator('h1')).toContainText('Amplify')
	})

	test('convex adapter docs page loads', async ({ page }) => {
		await page.goto('/docs/adapters/convex')
		await expect(page.getByRole('main').locator('h1')).toContainText('Convex')
	})
})

test.describe('Docs - Core Concepts', () => {
	test('authentication docs page loads', async ({ page }) => {
		await page.goto('/docs/authentication')
		await expect(page.getByRole('main').locator('h1')).toContainText('Authentication')
	})

	test('authorization docs page loads', async ({ page }) => {
		await page.goto('/docs/authorization')
		await expect(page.getByRole('main').locator('h1')).toContainText('Authorization')
	})

	test('session docs page loads', async ({ page }) => {
		await page.goto('/docs/session')
		await expect(page.getByRole('main').locator('h1')).toContainText('Session')
	})
})

test.describe('Docs - Components', () => {
	test('auth-provider component docs page loads', async ({ page }) => {
		await page.goto('/docs/components/auth-provider')
		await expect(page.getByRole('main').locator('h1')).toContainText('AuthProvider')
	})

	test('auth-button component docs page loads', async ({ page }) => {
		await page.goto('/docs/components/auth-button')
		await expect(page.getByRole('main').locator('h1')).toContainText('AuthButton')
	})

	test('auth-page component docs page loads', async ({ page }) => {
		await page.goto('/docs/components/auth-page')
		await expect(page.getByRole('main').locator('h1')).toContainText('AuthPage')
	})

	test('login-card component docs page loads', async ({ page }) => {
		await page.goto('/docs/components/login-card')
		await expect(page.getByRole('main').locator('h1')).toContainText('LoginCard')
	})
})

test.describe('Docs - Plugins & Tools', () => {
	test('CLI docs page loads', async ({ page }) => {
		await page.goto('/docs/cli')
		await expect(page.getByRole('main').locator('h1')).toContainText('CLI')
	})

	test('Vite plugin docs page loads', async ({ page }) => {
		await page.goto('/docs/plugins/vite')
		await expect(page.getByRole('main').locator('h1')).toContainText('Vite Plugin')
	})

	test('Guardian docs page loads', async ({ page }) => {
		await page.goto('/docs/guardian')
		await expect(page.getByRole('main').locator('h1')).toContainText('Guardian')
	})

	test('Logger docs page loads', async ({ page }) => {
		await page.goto('/docs/logger')
		await expect(page.getByRole('main').locator('h1')).toContainText('Logger')
	})
})

test.describe('Docs - Sidebar Navigation', () => {
	test('sidebar links navigate correctly', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Quick Start')
		await expect(page).toHaveURL(/\/docs\/quick-start/)
	})
})

test.describe('Docs Rendering', () => {
	test('no console errors on docs page', async ({ page }) => {
		const errors: string[] = []
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text())
			}
		})

		await page.goto('/docs')
		await page.waitForLoadState('networkidle')

		expect(errors.filter((e) => !e.includes('hydration') && !e.includes('404'))).toHaveLength(0)
	})
})
