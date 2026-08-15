import { defineConfig } from '@playwright/test'

const adapter = process.env.KAVACH_ADAPTER ?? 'supabase'

const adapters = {
	supabase: { port: 4173, envFile: '.env.test.supabase' },
	firebase: { port: 4174, envFile: '.env.test.firebase' },
	convex: { port: 4175, envFile: '.env.test.convex' }
}

const { port, envFile } = adapters[adapter] ?? adapters.supabase

export default defineConfig({
	testDir: 'e2e',
	testMatch: /.*\.e2e\.[jt]s/,
	globalSetup: './e2e/globalSetup.ts',

	projects: [{ name: adapter, use: { baseURL: `http://localhost:${port}` } }],

	webServer: {
		// The e2e suite exercises the demo app in its real context — build + preview it.
		// env files live in this workspace; source them so the demo build/preview sees them.
		command: `set -a && . ../showcase/${envFile} && set +a && npm run build && npm run preview -- --port ${port}`,
		port,
		reuseExistingServer: !process.env.CI,
		cwd: '../demo'
	}
})
