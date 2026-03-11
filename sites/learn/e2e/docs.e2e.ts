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
	test('can navigate to supabase adapter docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Adapters')
		await page.waitForTimeout(300)
		await page.click('aside >> text=Supabase')
		await expect(page).toHaveURL(/\/docs\/adapters\/supabase/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Supabase Adapter')
	})

	test('can navigate to firebase adapter docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Adapters')
		await page.waitForTimeout(300)
		await page.click('aside >> text=Firebase')
		await expect(page).toHaveURL(/\/docs\/adapters\/firebase/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Firebase Adapter')
	})

	test('can navigate to auth0 adapter docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Adapters')
		await page.waitForTimeout(300)
		await page.click('aside >> text=Auth0')
		await expect(page).toHaveURL(/\/docs\/adapters\/auth0/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Auth0 Adapter')
	})

	test('can navigate to amplify adapter docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Adapters')
		await page.waitForTimeout(300)
		await page.click('aside >> text=Amplify')
		await expect(page).toHaveURL(/\/docs\/adapters\/amplify/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Amplify Adapter')
	})

	test('can navigate to convex adapter docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Adapters')
		await page.waitForTimeout(300)
		await page.click('aside >> text=Convex')
		await expect(page).toHaveURL(/\/docs\/adapters\/convex/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Convex Adapter')
	})
})

test.describe('Docs - Core Concepts', () => {
	test('can navigate to authentication docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Authentication')
		await expect(page).toHaveURL(/\/docs\/authentication/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Authentication')
	})

	test('can navigate to authorization docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Authorization')
		await expect(page).toHaveURL(/\/docs\/authorization/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Authorization')
	})

	test('can navigate to session docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Session Management')
		await expect(page).toHaveURL(/\/docs\/session/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Session Management')
	})
})

test.describe('Docs - Components', () => {
	test('can navigate to auth-provider component', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Components')
		await page.waitForTimeout(300)
		await page.click('aside >> text=AuthProvider')
		await expect(page).toHaveURL(/\/docs\/components\/auth-provider/)
		await expect(page.getByRole('main').locator('h1')).toContainText('AuthProvider')
	})

	test('can navigate to auth-button component', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Components')
		await page.waitForTimeout(300)
		await page.click('aside >> text=AuthButton')
		await expect(page).toHaveURL(/\/docs\/components\/auth-button/)
		await expect(page.getByRole('main').locator('h1')).toContainText('AuthButton')
	})

	test('can navigate to auth-page component', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Components')
		await page.waitForTimeout(300)
		await page.click('aside >> text=AuthPage')
		await expect(page).toHaveURL(/\/docs\/components\/auth-page/)
		await expect(page.getByRole('main').locator('h1')).toContainText('AuthPage')
	})

	test('can navigate to login-card component', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Components')
		await page.waitForTimeout(300)
		await page.click('aside >> text=LoginCard')
		await expect(page).toHaveURL(/\/docs\/components\/login-card/)
		await expect(page.getByRole('main').locator('h1')).toContainText('LoginCard')
	})
})

test.describe('Docs - Plugins & Tools', () => {
	test('can navigate to CLI docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=CLI Commands')
		await expect(page).toHaveURL(/\/docs\/cli/)
		await expect(page.getByRole('main').locator('h1')).toContainText('CLI')
	})

	test('can navigate to Vite plugin docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Vite Plugin')
		await expect(page).toHaveURL(/\/docs\/plugins\/vite/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Vite Plugin')
	})

	test('can navigate to Guardian docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Guardian')
		await expect(page).toHaveURL(/\/docs\/guardian/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Guardian')
	})

	test('can navigate to Logger docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=Logger')
		await expect(page).toHaveURL(/\/docs\/logger/)
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
		page.on('console', msg => {
			if (msg.type() === 'error') {
				errors.push(msg.text())
			}
		})

		await page.goto('/docs')
		await page.waitForLoadState('networkidle')

		expect(errors.filter(e => !e.includes('hydration') && !e.includes('404'))).toHaveLength(0)
	})
})
