import extractorSvelte from '@unocss/extractor-svelte'
import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss'
import { presetRokkit } from '@rokkit/unocss'
import config from './rokkit.config.js'
import { DEFAULT_AUTH_ICONS } from 'kavach'

export default defineConfig({
	extractors: [extractorSvelte()],
	presets: [presetRokkit(config)],
	safelist: [...DEFAULT_AUTH_ICONS],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
