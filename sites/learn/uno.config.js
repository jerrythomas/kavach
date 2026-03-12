import extractorSvelte from '@unocss/extractor-svelte'
import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss'
import { presetRokkit } from '@rokkit/unocss'
import config from './rokkit.config.js'
import { DEFAULT_AUTH_ICONS } from 'kavach'

export default defineConfig({
	extractors: [extractorSvelte()],
	presets: [presetRokkit(config)],
	safelist: [
		...DEFAULT_AUTH_ICONS,
		// Demo platform icons (dynamic classes from platforms.ts data — must be safelisted)
		'i-auth:supabase',
		'i-auth:firebase',
		'i-app:shield',
		'i-app:login',
		'i-app:logout',
		'i-app:list',
		'i-app:code-visible',
		'i-app:code-hidden'
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
