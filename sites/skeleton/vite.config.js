import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [unocss(), sveltekit()],
	test: {
		include: ['spec/**/*.spec.js'],
		globals: true,
		environment: 'jsdom',
		coverage: {
			reporter: ['html', 'lcov'],
			all: false,
			include: ['src']
		}
	}
}

export default config
