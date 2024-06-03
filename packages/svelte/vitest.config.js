import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { testConfig } from 'shared-config'

testConfig.coverage.provider = 'v8'
export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: testConfig
})
