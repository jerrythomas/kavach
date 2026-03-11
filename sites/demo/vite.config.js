import { readFileSync } from 'fs'
import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'
import { kavach } from '@kavach/cli/vite'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [kavach(), unocss(), sveltekit()],
	resolve: {
		dedupe: ['svelte']
	},
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	}
}

export default config
