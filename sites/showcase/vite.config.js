import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'

export default defineConfig(({ mode }) => ({
	plugins: [svelte({ hot: false }), svelteTesting()],
	...(mode === 'test' && {
		resolve: {
			alias: {
				'$app/stores': fileURLToPath(new URL('./src/spec/mocks/app-stores.js', import.meta.url))
			}
		}
	}),
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/spec/**/*.spec.js'],
		exclude: ['node_modules/**'],
		setupFiles: ['./src/spec/setup.js']
	}
}))
