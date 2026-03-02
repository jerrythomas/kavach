import extractorSvelte from '@unocss/extractor-svelte'
import {
	defineConfig,
	presetTypography,
	presetMini as presetUno,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'

export default defineConfig({
	extractors: [extractorSvelte()],
	safelist: ['-translate-x-full'],
	shortcuts: {
		'action-remove': 'i-rokkit:action-cross',
		'dropdown-opened': 'accordion-opened',
		'item-selected': 'border-l-3 border-secondary',
		'state-danger': 'text-red',
		'item-hover':
			'bg-gradient-to-r from-primary-200 via-primary-200 bg-secondary-200 text-neutral-contrast'
	},
	theme: {
		fontFamily: {
			heading: ['Open Sans', 'sans-serif'],
			sans: ['Overpass', 'ui-serif', 'sans-serif'],
			body: ['Open Sans', '-apple-system', 'system-ui', 'Segoe-UI', 'ui-serif', 'sans-serif']
		}
	},
	presets: [
		presetUno(),
		presetTypography()
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
