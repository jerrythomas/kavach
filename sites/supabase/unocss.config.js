import { defineConfig } from 'unocss'
import { extractorSvelte } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import transformer from '@unocss/transformer-directives'
// import { iconShortcuts } from '@svelte-spice/core/themes'

/**
 *
 * @param {string} name
 * @returns
 */
function hslFromVariable(name) {
	const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

	return shades.reduce(
		(result, shade) => ({
			...result,
			[shade]: `hsl(var(--${name}-${shade}))`
		}),
		{ DEFAULT: `hsl(var(--${name}-500))` }
	)
}
export default defineConfig({
	safelist: [
		// ...Object.keys(iconShortcuts),
		'i-iconoir-input-field',
		'i-carbon-tree-view',
		'i-carbon:tree-view-alt',
		'i-carbon:list-dropdown',
		'i-carbon-chevron-sort',
		'logo-magic',
		'logo-google',
		'logo-facebook',
		'logo-twitter',
		'logo-github',
		'logo-linkedin',
		'logo-apple',
		'logo-mail',
		'logo-phone'
	],
	shortcuts: {
		// ...iconShortcuts,
		'logo-magic': 'i-carbon:link',
		'logo-google': 'i-flat-color-icons-google',
		'logo-facebook': 'i-entypo-social-facebook',
		'logo-twitter': 'i-entypo-social-twitter',
		'logo-github': 'i-entypo-social-github',
		'logo-linkedin': 'i-entypo-social-linkedin',
		'logo-apple': 'i-fa-brands-apple',
		'logo-mail': 'i-eva-email-outline',
		'logo-phone': 'i-eva-phone-fill',
		'bg-error': 'bg-red-100',
		'text-error': 'text-red-800',
		'border-error': 'border-red-700',
		'bg-info': 'bg-blue-100',
		'text-info': 'text-blue-800',
		'border-info': 'border-blue-700',
		'bg-warn': 'bg-orange-100',
		'text-warn': 'text-orange-800',
		'border-warn': 'border-orange-700',
		'bg-pass': 'bg-green-100',
		'text-pass': 'text-green-800',
		'border-pass': 'border-green-700',
		'bg-disabled': 'bg-skin-100',
		'text-disabled': 'text-skin-300',
		'border-disabled': 'border-skin-700',
		'item-selected': 'border-l-3 border-secondary',
		'item-hover':
			'bg-gradient-to-r from-primary-200 via-primary-200 bg-secondary-200 text-skin-contrast'
	},
	theme: {
		fontFamily: {
			mono: ['Victor-Mono', 'monospace'],
			serif: ['Roboto', 'ui-sans-serif', 'sans-serif'],
			body: ['Roboto', 'ui-sans-serif', 'sans-serif']
		},
		colors: {
			primary: hslFromVariable('primary'),
			secondary: hslFromVariable('secondary'),
			accent: hslFromVariable('accent'),
			skin: {
				base: 'hsl(var(--skin-50))',
				contrast: 'hsl(var(--skin-900))',
				zebra: 'hsl(var(--skin-zebra))',
				...hslFromVariable('skin')
			}
		}
	},
	presets: [presetUno(), presetIcons({})],
	extractors: [extractorSvelte],
	transformers: [transformer()]
})
