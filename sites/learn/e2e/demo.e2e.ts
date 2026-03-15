import { expect, test } from '@playwright/test'

test.describe('Demo landing page', () => {
	test('loads with hero heading', async ({ page }) => {
		await page.goto('/demo')
		await expect(page.locator('h1')).toContainText('Kavach Demo')
	})

	test('shows all five platform cards', async ({ page }) => {
		await page.goto('/demo')
		const cards = page.locator('a[href^="/demo/"]')
		await expect(cards).toHaveCount(5) // supabase, firebase, auth0, amplify, convex
	})

	test('supabase card links to /demo/supabase', async ({ page }) => {
		await page.goto('/demo')
		await expect(page.locator('a[href="/demo/supabase"]')).toBeVisible()
	})

	test('firebase card links to /demo/firebase', async ({ page }) => {
		await page.goto('/demo')
		await expect(page.locator('a[href="/demo/firebase"]')).toBeVisible()
	})

	test('convex card links to /demo/convex', async ({ page }) => {
		await page.goto('/demo')
		await expect(page.locator('a[href="/demo/convex"]')).toBeVisible()
	})
})

test.describe('Demo platform detail pages — live platforms', () => {
	for (const id of ['supabase', 'firebase', 'convex']) {
		test(`${id} platform page loads`, async ({ page }) => {
			await page.goto(`/demo/${id}`)
			await expect(page.locator('h1')).not.toBeEmpty()
		})

		test(`${id} platform page shows Launch demo link with non-empty href`, async ({ page }) => {
			await page.goto(`/demo/${id}`)
			const link = page.locator('a:has-text("Launch")')
			await expect(link).toBeVisible()
			// href must be a non-empty URL (set from env var)
			const href = await link.getAttribute('href')
			expect(href).toBeTruthy()
			expect(href).toMatch(/^https?:\/\//)
		})

		test(`${id} platform page has back link to /demo`, async ({ page }) => {
			await page.goto(`/demo/${id}`)
			await expect(page.locator('a[href="/demo"]')).toBeVisible()
		})
	}
})

test.describe('Demo platform detail pages — coming soon', () => {
	for (const id of ['auth0', 'amplify']) {
		test(`${id} platform page shows COMING SOON badge`, async ({ page }) => {
			await page.goto(`/demo/${id}`)
			await expect(page.locator('span:has-text("COMING SOON")')).toBeVisible()
		})
	}
})
