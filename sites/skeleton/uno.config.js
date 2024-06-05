import extractorSvelte from '@unocss/extractor-svelte'
import {
	defineConfig,
	presetIcons,
	presetMini as presetUno,
	presetTypography,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'
import { iconShortcuts, defaultIcons, themeColors, themeRules } from '@rokkit/themes'
import { defaultAuthIcons } from '@kavach/core'

export default defineConfig({
	content: {
		pipeline: {
			include: ['src/**/*.svelte', 'src/**/*.css']
		}
	},
	extractors: [extractorSvelte()],
	rules: [...themeRules()],
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
		colors: themeColors()
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
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
