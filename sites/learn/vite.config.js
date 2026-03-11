import { kavach } from '@kavach/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import unocss from '@unocss/vite'

export default defineConfig({
	plugins: [kavach(), unocss(), sveltekit()],
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
