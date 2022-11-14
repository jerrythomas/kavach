import { expect, test } from '@playwright/test'

test('index page has expected h1', async ({ page }) => {
	await page.goto('https://boothpics.com/R8AJ')
	// await page.setViewport({ width: 1792, height: 924 })
	await page.waitForSelector(
		'.event-toolbar > .container-fluid > .d-none > .slideshow-btn > span'
	)
	await page.click(
		'.event-toolbar > .container-fluid > .d-none > .slideshow-btn > span'
	)
})
