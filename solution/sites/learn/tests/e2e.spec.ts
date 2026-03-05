import { expect, test } from '@playwright/test'

test.describe('Site Navigation', () => {
	test('home page loads and has correct title', async ({ page }) => {
		await page.goto('/')
		await expect(page).toHaveTitle(/Kavach/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Kavach')
	})

	test('home page has navigation links', async ({ page }) => {
		await page.goto('/')
		const nav = page.locator('nav')
		await expect(nav).toContainText('Home')
		await expect(nav).toContainText('Docs')
		await expect(nav).toContainText('Demo')
	})

	test('can navigate to docs from home', async ({ page }) => {
		await page.goto('/')
		await page.click('nav >> text=Docs')
		await expect(page).toHaveURL(/\/docs/)
	})

	test('can navigate to demo from home', async ({ page }) => {
		await page.goto('/')
		await page.click('nav >> text=Demo')
		await expect(page).toHaveURL(/\/auth/)
	})
})

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
		// Click on Quick Start in the sidebar
		await page.click('text=Quick Start')
		await expect(page).toHaveURL(/\/docs\/quick-start/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Quick Start')
	})

	test('can navigate to supabase adapter docs', async ({ page }) => {
		await page.goto('/docs')
		// Click to expand Adapters group first
		await page.click('text=Adapters')
		// Wait for animation
		await page.waitForTimeout(300)
		// Then click on Supabase
		await page.click('aside >> text=Supabase')
		await expect(page).toHaveURL(/\/docs\/adapters\/supabase/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Supabase Adapter')
	})

	test('can navigate to firebase adapter docs', async ({ page }) => {
		await page.goto('/docs')
		// Click to expand Adapters group first
		await page.click('text=Adapters')
		// Wait for animation
		await page.waitForTimeout(300)
		// Then click on Firebase
		await page.click('aside >> text=Firebase')
		await expect(page).toHaveURL(/\/docs\/adapters\/firebase/)
		await expect(page.getByRole('main').locator('h1')).toContainText('Firebase Adapter')
	})

	test('can navigate to CLI docs', async ({ page }) => {
		await page.goto('/docs')
		await page.click('text=CLI Commands')
		await expect(page).toHaveURL(/\/docs\/cli/)
		await expect(page.getByRole('main').locator('h1')).toContainText('CLI Commands')
	})
})

test.describe('Demo/Auth Pages', () => {
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

	test('demo pages exist', async ({ page }) => {
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

test.describe('All Links are Navigable', () => {
	test('home page links work', async ({ page }) => {
		await page.goto('/')
		
		// Check Try Demo button
		await page.click('text=Try Demo')
		await expect(page).toHaveURL(/\/auth/)
		
		// Go back home
		await page.goto('/')
		
		// Check View on GitHub link
		const githubLink = page.locator('a:has-text("View on GitHub")')
		await expect(githubLink).toHaveAttribute('href', 'https://github.com/jerrythomas/kavach')
	})

	test('navigation links are all accessible', async ({ page }) => {
		await page.goto('/')
		
		// Test Home link
		await expect(page.locator('nav >> a:has-text("Home")')).toHaveAttribute('href', '/')
		
		// Test Docs link
		await expect(page.locator('nav >> a:has-text("Docs")')).toHaveAttribute('href', '/docs')
		
		// Test Demo link
		await expect(page.locator('nav >> a:has-text("Demo")')).toHaveAttribute('href', '/auth')
	})

	test('docs sidebar links navigate correctly', async ({ page }) => {
		await page.goto('/docs')
		
		// Check Getting Started section
		await page.click('text=Quick Start')
		await expect(page).toHaveURL(/\/docs\/quick-start/)
		
		// Go back to docs
		await page.goto('/docs')
		
		// Expand Adapters section
		await page.click('text=Adapters')
		await page.waitForTimeout(300)
		
		// Check Adapters section
		await page.click('aside >> text=Supabase')
		await expect(page).toHaveURL(/\/docs\/adapters\/supabase/)
		
		// Go back to docs
		await page.goto('/docs')
		
		// Check Plugins section
		await page.click('text=CLI Commands')
		await expect(page).toHaveURL(/\/docs\/cli/)
	})
})

test.describe('Page Rendering', () => {
	test('no console errors on home page', async ({ page }) => {
		const errors: string[] = []
		page.on('console', msg => {
			if (msg.type() === 'error') {
				errors.push(msg.text())
			}
		})
		
		await page.goto('/')
		await page.waitForLoadState('networkidle')
		
		expect(errors.filter(e => !e.includes('hydration') && !e.includes('404'))).toHaveLength(0)
	})

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
