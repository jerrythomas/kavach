import { test, expect } from '@playwright/test'

test.describe('Auth flows', () => {
	test('redirects unauthenticated user to /auth', async ({ page }) => {
		await page.goto('/')
		await expect(page).toHaveURL(/\/auth/)
	})

	test('public page is accessible without auth', async ({ page }) => {
		await page.goto('/public')
		await expect(page.locator('text=This is a public page')).toBeVisible()
	})

	test('auth page renders login form', async ({ page }) => {
		await page.goto('/auth')
		await expect(page.locator('text=Continue With Azure')).toBeVisible()
	})
})
