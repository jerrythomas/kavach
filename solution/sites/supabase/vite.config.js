import { readFileSync } from 'fs'
import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [unocss(), sveltekit()],
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
	vitePlugin: {
		inspector: {
			showToggleButton: 'always'
		}
	}
}

export default config
