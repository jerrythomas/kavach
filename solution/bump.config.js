// import defineConfig from 'bumpp'

export default {
	files: [
		'package.json',
		'packages/*/package.json',
		'adapters/*/package.json',
		'sites/*/package.json'
	],
	recursive: true
}
