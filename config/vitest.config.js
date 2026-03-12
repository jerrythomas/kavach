import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		clearMocks: true,
		include: ['**/spec/**/*.{spec,spec.svelte}.[jt]s'],
		exclude: ['**/node_modules/**', '**/dist/**'],
		coverage: {
			provider: 'v8',
			all: true,
			reporter: ['text', 'html', 'lcov', 'json'],
			include: ['**/src/**'],
			exclude: [
				'**/spec/**',
				'**/node_modules/**',
				'**templates/**',
				'**/dist/**',
				'**/sites/**',
				'**/fixtures/**'
			]
		},
		projects: [
			{
				extends: true,
				test: {
					name: 'auth',
					root: 'packages/auth',
					setupFiles: ['../../config/vitest-setup-auth.js']
				}
			},
			{ extends: true, test: { name: 'cookie', root: 'packages/cookie' } },
			{ extends: true, test: { name: 'sentry', root: 'packages/sentry' } },
			{ extends: true, test: { name: 'hashing', root: 'packages/hashing' } },
			{ extends: true, test: { name: 'logger', root: 'packages/logger' } },
			{ extends: true, test: { name: 'query', root: 'packages/query' } },
			{
				extends: true,
				plugins: [svelte({ hot: false }), svelteTesting()],
				test: {
					name: 'ui',
					root: 'packages/ui',
					setupFiles: ['../../config/vitest-setup-client.js']
				}
			},
			{ extends: true, test: { name: 'supabase', root: 'adapters/supabase' } },
			{ extends: true, test: { name: 'convex', root: 'adapters/convex' } },
			{ extends: true, test: { name: 'firebase', root: 'adapters/firebase' } },
			{ extends: true, test: { name: 'auth0', root: 'adapters/auth0' } },
			{ extends: true, test: { name: 'amplify', root: 'adapters/amplify' } },
			{ extends: true, test: { name: 'demo', root: 'sites/demo' } },
			{ extends: true, test: { name: 'cli', root: 'packages/cli' } },
			{ extends: true, test: { name: 'vite', root: 'packages/vite' } }
		]
	}
})
