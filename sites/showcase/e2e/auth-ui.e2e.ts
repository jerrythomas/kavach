import { expect, test, type Page } from './fixtures.js'

// Real-backend auth flows — exercise the demo UI against live providers, not
// stubbed cookies. Each adapter must have a local backend running.
//
// - supabase:  supabase start (GoTrue + mailpit on :54331/:54334)
// - firebase:  firebase emulators:start (auth on :9099)
// - convex:    convex dev --local (:3210) — no password provider, only landing CTA tested

const MAILPIT = 'http://127.0.0.1:54334'

const ADAPTER = process.env.KAVACH_ADAPTER ?? 'supabase'
const HAS_PASSWORD = ADAPTER === 'supabase' || ADAPTER === 'firebase'

async function clearMailbox(page: Page) {
	await page.context().request.delete(`${MAILPIT}/api/v1/messages`)
}

async function lastVerifyLink(page: Page): Promise<string> {
	const list = await (await page.context().request.get(`${MAILPIT}/api/v1/messages`)).json()
	const messages = list.messages ?? []
	for (const message of messages) {
		const detail = await (
			await page.context().request.get(`${MAILPIT}/api/v1/message/${message.ID}`)
		).json()
		const match = (detail.Text ?? '').match(/https?:\/\/\S+\/auth\/v1\/verify\S*/)
		if (match) return match[0].replace(/[\)\s,;]+$/, '')
	}
	throw new Error('No magic link found in mailpit mailbox')
}

// ---------------------------------------------------------------------------
// Landing page CTA — runs on all adapters
// ---------------------------------------------------------------------------
test.describe('Landing page CTA', () => {
	test('shows sign-in CTA when unauthenticated', async ({ page }) => {
		await page.goto('/')
		await expect(page.locator('a[href="/auth"]', { hasText: 'Sign in to try it' })).toBeVisible()
	})

	test('shows dashboard CTA when authenticated', async ({ page, loginAsUser }) => {
		await loginAsUser('user')
		await page.goto('/')
		await expect(page.locator('a[href="/dashboard"]', { hasText: 'Go to dashboard' })).toBeVisible()
	})
})

// ---------------------------------------------------------------------------
// Password sign-in — supabase + firebase (both have Email+Password provider)
// ---------------------------------------------------------------------------
test.describe('Password sign-in', () => {
	test.skip(!HAS_PASSWORD, 'adapter does not have a password provider')

	test('signs in with email + password and reaches the dashboard', async ({ page }) => {
		await page.goto('/auth')
		const form = page.locator('[data-auth-provider="email"]')
		const email = form.locator('input[name="email"]')
		const password = form.locator('input[name="password"]')
		await email.waitFor({ state: 'visible', timeout: 10000 })
		await email.fill('test@test.com')
		await password.fill('password123')
		await form.locator('button[data-auth-mode="password"]').click()

		await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
		await expect(page.locator('h1')).toContainText('Welcome back')
		await expect(page.locator('main')).toContainText('test@test.com')

		const session = (await page.context().cookies('http://localhost:4173')).find((c) => c.name === 'session')
		expect(session).toBeTruthy()
	})

	test('shows an inline error and stays on /auth for a wrong password', async ({ page }) => {
		await page.goto('/auth')
		const form = page.locator('[data-auth-provider="email"]')
		const email = form.locator('input[name="email"]')
		const password = form.locator('input[name="password"]')
		await email.waitFor({ state: 'visible', timeout: 10000 })
		await email.fill('test@test.com')
		await password.fill('wrong-password')
		await form.locator('button[data-auth-mode="password"]').click()

		// Adapter-specific error text — both are rendered inline via data-auth-result
		const errorText = ADAPTER === 'firebase' ? 'wrong-password' : 'Invalid credentials'
		await expect(page.locator('[data-auth-result]')).toContainText(errorText, { timeout: 10000 })
		await expect(page).toHaveURL(/\/auth/)
	})
})

// ---------------------------------------------------------------------------
// Magic link sign-in — supabase only (uses mailpit for email verification)
// ---------------------------------------------------------------------------
test.describe('Magic link sign-in', () => {
	test.skip(ADAPTER !== 'supabase', 'requires the local supabase stack + mailpit')

	test.beforeEach(async ({ page }) => {
		await clearMailbox(page)
	})

	test('shows the "sent" message, then signs in via the emailed link', async ({ page }) => {
		await page.goto('/auth')
		const magic = page.locator('[data-auth-provider="magic"]')
		const input = magic.locator('input[name="magic"]')
		await input.waitFor({ state: 'visible', timeout: 10000 })
		await input.fill('test@test.com')
		await magic.locator('button').click()

		await expect(page.locator('[data-auth-result]')).toContainText('Magic link has been sent', {
			timeout: 10000
		})
		await expect(page).toHaveURL(/\/auth/)

		const link = await lastVerifyLink(page)
		await page.goto(link)

		// Session syncs to the server once supabase-js detects the token in the
		// redirect hash; the landing CTA flips to "Go to dashboard".
		await expect(page.locator('a[href="/dashboard"]', { hasText: 'Go to dashboard' })).toBeVisible({
			timeout: 15000
		})
		const session = (await page.context().cookies('http://localhost:4173')).find((c) => c.name === 'session')
		expect(session).toBeTruthy()

		await page.goto('/dashboard')
		await expect(page.locator('h1')).toContainText('Welcome back')
		await expect(page.locator('main')).toContainText('test@test.com')
	})
})
