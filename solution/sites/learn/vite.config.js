import { kavach } from '@kavach/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import unocss from '@unocss/vite'

export default defineConfig({
				plugins: [kavach(), unocss(), sveltekit()],
				test: {
								include: ['src/**/*.{test,spec}.{js,ts}']
				}
})