import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
	resolve: {
		// Resolve workspace packages to their SOURCE, not their built output.
		// Published `exports` send Node consumers to `dist/`, which only exists
		// after a build — without this, `bun run test:ci` on a clean checkout
		// fails to resolve `kavach` from the adapters. Tests should read source
		// anyway: coverage instruments `**/src/**`, and making the suite depend
		// on a prior build is a trap. `svelte` is the condition these packages
		// point at `src`.
		conditions: ['svelte', 'module', 'browser', 'development|production']
	},
	test: {
		globals: true,
		environment: 'jsdom',
		clearMocks: true,
		include: ['**/spec/**/*.{spec,spec.svelte}.[jt]s'],
		exclude: ['**/node_modules/**', '**/dist/**', '.worktrees/**'],
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
				test: {
					name: 'packaging',
					root: repoRoot,
					include: ['spec/packaging.spec.js'],
					environment: 'node'
				}
			},
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
				plugins: [svelte(), svelteTesting()],
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
			{
				extends: true,
				plugins: [svelte(), svelteTesting()],
				resolve: {
					alias: {
						'$app/stores': new URL(
							'../sites/showcase/src/spec/mocks/app-stores.js',
							import.meta.url
						).pathname
					}
				},
				test: {
					name: 'showcase',
					root: 'sites/showcase',
					setupFiles: ['../../config/vitest-setup-client.js']
				}
			},
			{ extends: true, test: { name: 'cli', root: 'packages/cli' } },
			{
				extends: true,
				server: { fs: { allow: ['/'] } },
				test: { name: 'vite', root: 'packages/vite' }
			}
		]
	}
})
