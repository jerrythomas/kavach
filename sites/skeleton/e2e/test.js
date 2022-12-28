import { expect, test } from '@playwright/test'
const { playwright } = require('playwright')

// Replace with the email address and password for the Google account
const email = 'your-email@gmail.com'
const password = 'your-password'

test('index page has expected h1', async ({ page }) => {
	await page.goto('/')
	expect(await page.textContent('h1')).toBe('Welcome to SvelteKit')
})

const getMagicLink = async () => {
	// Start a Playwright browser instance
	const browser = await playwright.chromium.launch()
	const context = await browser.newContext()
	const page = await context.newPage()

	// Navigate to the Google login page
	await page.goto('https://accounts.google.com/')

	// Enter the email address and click "Next"
	await page.fill('input[type=email]', email)
	await page.click('#identifierNext')

	// Wait for the password input to be visible
	await page.waitForSelector('input[type=password]')

	// Enter the password and click "Next"
	await page.fill('input[type=password]', password)
	await page.click('#passwordNext')

	// Wait for the Gmail page to load
	await page.waitForSelector('.z0')

	// Search for emails with the subject "Magic Link"
	await page.fill('.gbqfq', 'subject:Magic Link')
	await page.click('.gbqfb')

	// Wait for the search results to load
	await page.waitForSelector('.yW')

	// Get the first email in the search results
	const emailElement = await page.$('.yW')

	// Click on the email to open it
	await emailElement.click()

	// Wait for the magic link to be visible
	await page.waitForSelector('a[href*="magic"]')

	// Get the magic link from the email
	const magicLink = await page.$eval('a[href*="magic"]', (a) => a.href)

	console.log(magicLink)

	// Close the browser
	await browser.close()
	return magicLink
}

test('Verify page loads correctly', async () => {
	const page = await browser.newPage()
	await page.goto('https://kavach.vercel.app/')
	await page.waitForSelector('body')
	const bodyText = await page.evaluate(() => document.body.textContent)
	expect(bodyText).toContain('Kavach')
})

test('Magic link auth', async () => {
	// click on magic link button
	const link = await getMagicLink()
	// switch to magic link
	// verify that user is authenticated
})
test('Test login form', async () => {
	const page = await browser.newPage()
	await page.goto('https://kavach.vercel.app/login')
	await page.waitForSelector('form')
	await page.type('input[name=email]', 'test@example.com')
	await page.type('input[name=password]', 'password123')
	await page.click('button[type=submit]')
	await page.waitForSelector('.alert-success')
	const alertText = await page.evaluate(
		() => document.querySelector('.alert-success').textContent
	)
	expect(alertText).toContain('You are now logged in')
})

test('Verify "Create Account" link', async () => {
	const page = await browser.newPage()
	await page.goto('https://kavach.vercel.app/login')
	await page.waitForSelector('a[href="/signup"]')
	await page.click('a[href="/signup"]')
	await page.waitForSelector('h1')
	const headerText = await page.evaluate(
		() => document.querySelector('h1').textContent
	)
	expect(headerText).toEqual('Create an Account')
})

test('Test "Forgot Password" feature', async () => {
	const page = await browser.newPage()
	await page.goto('https://kavach.vercel.app/login')
	await page.waitForSelector('a[href="/forgot-password"]')
	await page.click('a[href="/forgot-password"]')
	await page.waitForSelector('form')
	await page.type('input[name=email]', 'test@example.com')
	await page.click('button[type=submit]')
	await page.waitForSelector('.alert-success')
	const alertText = await page.evaluate(
		() => document.querySelector('.alert-success').textContent
	)
	expect(alertText).toContain('An email has been sent to reset your password')
})
