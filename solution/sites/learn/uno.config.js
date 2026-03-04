import extractorSvelte from '@unocss/extractor-svelte'
import {
	defineConfig,
	presetIcons,
	presetTypography,
	presetWind,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'
import { Theme, DEFAULT_ICONS, iconShortcuts } from '@rokkit/core'

const theme = new Theme()

export default defineConfig({
	extractors: [extractorSvelte()],
	safelist: [...DEFAULT_ICONS],
	shortcuts: [
		['skin-default', theme.getPalette()],
		...theme.getShortcuts('primary'),
		...theme.getShortcuts('neutral'),
		...Object.entries(iconShortcuts(DEFAULT_ICONS, 'i-rokkit'))
	],
	theme: {
		colors: theme.getColorRules()
	},
	presets: [
		presetWind(),
		presetTypography(),
		presetIcons({
			collections: {
				rokkit: () => import('@rokkit/icons/ui.json').then((i) => i.default)
			}
		})
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
