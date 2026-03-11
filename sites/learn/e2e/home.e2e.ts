import { expect, test } from '@playwright/test'

test.describe('Home Page', () => {
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
		await expect(page).toHaveURL(/\/demo\/supabase/)
	})
})

test.describe('Home Page Links', () => {
	test('Try Demo button navigates to demo', async ({ page }) => {
		await page.goto('/')
		await page.click('text=Try Demo')
		await expect(page).toHaveURL(/\/demo\/supabase/)
	})

	test('View on GitHub link is correct', async ({ page }) => {
		await page.goto('/')
		const githubLink = page.locator('a:has-text("View on GitHub")')
		await expect(githubLink).toHaveAttribute('href', 'https://github.com/jerrythomas/kavach')
	})

	test('navigation links have correct hrefs', async ({ page }) => {
		await page.goto('/')
		await expect(page.locator('nav >> a:has-text("Home")')).toHaveAttribute('href', '/')
		await expect(page.locator('nav >> a:has-text("Docs")')).toHaveAttribute('href', '/docs')
		await expect(page.locator('nav >> a:has-text("Demo")')).toHaveAttribute('href', '/demo/supabase')
	})
})

test.describe('Home Page Rendering', () => {
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
})
