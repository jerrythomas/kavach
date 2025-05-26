import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'

export default defineConfig({
	plugins: [svelteTesting()],
	test: {
		globals: true,
		environment: 'jsdom',
		clearMocks: true,
		include: ['**/*.{spec,spec.svelte}.[jt]s'],
		setupFiles: ['./vitest-setup-client.js'],
		coverage: {
			all: true,
			reporter: ['text', 'html', 'lcov', 'json'],
			include: ['**/src/**'],
			exclude: ['**/spec/**', '**/node_modules/**', '**/dist/**', '**/sites/**', '**/fixtures/**']
		}
	}
})
