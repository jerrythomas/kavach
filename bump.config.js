// import defineConfig from 'bumpp'

export default {
	files: [
		'package.json',
		'pnpm-lock.yaml',
		'packages/*/package.json',
		'adapters/*/package.json',
		'shared/*/package.json',
		'sites/*/package.json'
	],
	recursive: true
}
