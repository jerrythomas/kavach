import extractorSvelte from '@unocss/extractor-svelte'
import {
	defineConfig,
	presetIcons,
	presetTypography,
	presetMini as presetUno,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'

import { iconShortcuts, defaultIcons, themeColors, themeRules } from '@rokkit/themes'
import { defaultAuthIcons } from '@kavach/core'

export default defineConfig({
	extractors: [extractorSvelte()],
	safelist: [...defaultIcons, ...defaultAuthIcons, '-translate-x-full'],
	rules: [...themeRules()],
	shortcuts: {
		...iconShortcuts(defaultIcons, 'i-rokkit'),
		'action-remove': 'i-rokkit:action-cross',
		'dropdown-opened': 'accordion-opened',
		'item-selected': 'border-l-3 border-secondary',
		'state-danger': 'text-red',
		'item-hover':
			'bg-gradient-to-r from-primary-200 via-primary-200 bg-secondary-200 text-neutral-contrast'
	},
	theme: {
		fontFamily: {
			mono: ['Victor Mono', 'monospace'],
			cursive: ['Lemonada', 'cursive'],
			heading: ['Open Sans', 'sans-serif'],
			sans: ['Overpass', 'ui-serif', 'sans-serif'],
			body: ['Open Sans', '-apple-system', 'system-ui', 'Segoe-UI', 'ui-serif', 'sans-serif']
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
				// app: () => import('@rokkit/icons/app.json').then((i) => i.default)
				// solar: () => import('@iconify-json/solar/icons.json').then((i) => i.default)
			}
		})
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
