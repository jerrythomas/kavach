import { readFileSync } from 'fs'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import unocss from 'unocss/vite'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
export default defineConfig({
	plugins: [unocss(), sveltekit()],
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
})
