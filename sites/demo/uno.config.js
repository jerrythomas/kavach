import extractorSvelte from '@unocss/extractor-svelte'
import {
	defineConfig,
	presetIcons,
	presetTypography,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'
import { shades, defaultPalette, DEFAULT_ICONS, iconShortcuts } from '@rokkit/core'
import { Theme } from '@rokkit/core'

const theme = new Theme()

export default defineConfig({
	extractors: [extractorSvelte()],
	content: {
		pipeline: {
			include: [
				'src/**/*.{svelte,js,ts}',
				'../../packages/ui/src/**/*.svelte',
				'../../node_modules/@rokkit/themes/src/**/*.css'
			]
		}
	},
	safelist: [
		...DEFAULT_ICONS,
		'-translate-x-full'
	],
	shortcuts: [
		['skin-default', theme.getPalette()],
		...theme.getShortcuts('surface'),
		...theme.getShortcuts('primary'),
		...theme.getShortcuts('secondary'),
		...theme.getShortcuts('accent'),
		...theme.getShortcuts('success'),
		...theme.getShortcuts('warning'),
		...theme.getShortcuts('danger'),
		...theme.getShortcuts('error'),
		...theme.getShortcuts('info'),
		...Object.entries(iconShortcuts(DEFAULT_ICONS, 'i-rokkit')),
		['text-on-primary', 'text-surface-50'],
		['text-on-secondary', 'text-surface-50'],
		{
			'action-remove': 'i-rokkit:action-cross',
			'dropdown-opened': 'accordion-opened',
			'item-selected': 'border-l-3 border-secondary',
			'state-danger': 'text-red',
			'item-hover':
				'bg-gradient-to-r from-primary-200 via-primary-200 bg-secondary-200 text-neutral-contrast'
		}
	],
	theme: {
		fontFamily: {
			heading: ['Open Sans', 'sans-serif'],
			sans: ['Overpass', 'ui-serif', 'sans-serif'],
			body: ['Open Sans', '-apple-system', 'system-ui', 'Segoe-UI', 'ui-serif', 'sans-serif']
		},
		colors: theme.getColorRules()
	},
	presets: [
		presetWind3(),
		presetTypography(),
		presetIcons({
			extraProperties: {
				display: 'inline-block'
			},
			collections: {
				rokkit: () =>
					import('@rokkit/icons/ui.json', { with: { type: 'json' } }).then((i) => i.default),
				logo: () =>
					import('@rokkit/icons/auth.json', { with: { type: 'json' } }).then((i) => i.default),
				auth: () =>
					import('@rokkit/icons/auth.json', { with: { type: 'json' } }).then((i) => i.default),
				component: () =>
					import('@rokkit/icons/components.json', { with: { type: 'json' } }).then((i) => i.default)
			}
		})
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
