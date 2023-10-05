import { defineConfig } from 'unocss'
import extractorSvelte from '@unocss/extractor-svelte'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import transformer from '@unocss/transformer-directives'
import presetTypography from '@unocss/preset-typography'
import { iconShortcuts, defaultIcons, themeColors } from '@rokkit/themes'
import { defaultAuthIcons } from '@kavach/core'

export default defineConfig({
	extractors: [extractorSvelte()],
	safelist: [...defaultIcons, ...defaultAuthIcons, '-translate-x-full'],
	shortcuts: {
		...iconShortcuts(defaultIcons, 'i-rokkit')
	},
	theme: {
		fontFamily: {
			mono: ['Victor Mono', 'monospace'],
			heading: ['Allan', 'sans-serif'],
			sans: ['Lato', 'ui-serif', 'sans-serif'],
			body: ['Lato', '-apple-system', 'system-ui', 'Segoe-UI', 'ui-serif', 'sans-serif']
		},
		colors: themeColors('hsl')
	},
	presets: [
		presetUno(),
		presetTypography(),
		presetIcons({
			collections: {
				rokkit: () => import('@rokkit/icons/ui.json').then((i) => i.default),
				auth: () => import('@rokkit/icons/auth.json').then((i) => i.default)
			}
		})
	],
	transformers: [transformer()]
})
