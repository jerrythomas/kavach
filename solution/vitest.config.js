import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'

export default defineConfig({
	plugins: [
		svelte({
			hot: false
		}),
		svelteTesting()
	],
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
			{ extends: true, test: { name: 'deflector', root: 'packages/deflector' } },
			{ extends: true, test: { name: 'hashing', root: 'packages/hashing' } },
			{ extends: true, test: { name: 'logger', root: 'packages/logger' } },
			{ extends: true, test: { name: 'query', root: 'packages/query' } },
			{
				extends: true,
				test: {
					name: 'ui',
					root: 'packages/ui',
					setupFiles: ['../../vitest-setup-client.js']
				}
			},
			{ extends: true, test: { name: 'supabase', root: 'adapters/supabase' } },
			{ extends: true, test: { name: 'convex', root: 'adapters/convex' } },
			{ extends: true, test: { name: 'firebase', root: 'adapters/firebase' } }
		]
	}
})
