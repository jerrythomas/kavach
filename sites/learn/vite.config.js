import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import unocss from '@unocss/vite'

export default defineConfig({
	plugins: [unocss(), sveltekit()],
	optimizeDeps: {
		exclude: ['@rokkit/app', '@rokkit/ui', '@rokkit/states', '@rokkit/actions']
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('/svelte/') || id.includes('.bun/svelte')) {
						return 'vendor-svelte'
					}
				}
			}
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
})
