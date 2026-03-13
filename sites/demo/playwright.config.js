/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: true,
		env: {
			KAVACH_ADAPTER: process.env.KAVACH_ADAPTER ?? 'supabase',
			PUBLIC_KAVACH_ADAPTER: process.env.KAVACH_ADAPTER ?? 'supabase'
		}
	},
	testDir: 'e2e',
	testMatch: /.*\.e2e\.[jt]s/
}

export default config
