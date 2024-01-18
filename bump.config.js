import { defineConfig } from 'bumpp'

export default defineConfig({
	files: [
		'package.json',
		'pnpm-lock.yaml',
		'packages/*/package.json',
		'adapters/*/package.json',
		'shared/*/package.json',
		'sites/*/package.json',
		'starter/*/package.json'
	],
	recursive: true
})
