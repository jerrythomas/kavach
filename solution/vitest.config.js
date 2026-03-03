import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		clearMocks: true,
		include: ['spec/**/*.{spec,spec.svelte}.[jt]s'],
		exclude: ['**/node_modules/**', '**/dist/**'],
		coverage: {
			all: true,
			reporter: ['text', 'html', 'lcov', 'json'],
			include: ['**/src/**'],
			exclude: ['**/spec/**', '**/node_modules/**', '**/dist/**', '**/sites/**', '**/fixtures/**']
		},
		projects: [
			{ extends: true, test: { name: 'auth', root: 'packages/auth' } },
			{ extends: true, test: { name: 'cookie', root: 'packages/cookie' } },
			{ extends: true, test: { name: 'guardian', root: 'packages/guardian' } },
			{ extends: true, test: { name: 'hashing', root: 'packages/hashing' } },
			{ extends: true, test: { name: 'logger', root: 'packages/logger' } },
			{ extends: true, test: { name: 'query', root: 'packages/query' } },
			{
				extends: true,
				plugins: [svelte({ hot: false }), svelteTesting()],
				test: {
					name: 'ui',
					root: 'packages/ui',
					setupFiles: ['../../vitest-setup-client.js']
				}
			},
			{ extends: true, test: { name: 'supabase', root: 'adapters/supabase' } },
			{ extends: true, test: { name: 'convex', root: 'adapters/convex' } },
			{ extends: true, test: { name: 'firebase', root: 'adapters/firebase' } },
			{ extends: true, test: { name: 'auth0', root: 'adapters/auth0' } },
			{ extends: true, test: { name: 'amplify', root: 'adapters/amplify' } },
			{ extends: true, test: { name: 'demo', root: 'sites/demo' } },
			{ extends: true, test: { name: 'cli', root: 'packages/cli' } }
		]
	}
})
