module.exports = {
	extends: ['eslint:recommended', 'prettier', 'plugin:svelte/prettier'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 'latest',
		allowImportExportEverywhere: false
	},
	env: {
		browser: true,
		es6: true,
		node: true
	},
	ignorePatterns: ['dist'],
	rules: {
		complexity: ['error', 5],
		'max-depth': ['error', 2],
		'max-params': ['error', 4],
		'no-console': 'error',
		'no-return-await': 'error',
		'prefer-const': 'error',
		'prefer-template': 'error',
		eqeqeq: 'error',
		'no-eq-null': 'error',
		'no-implicit-coercion': 'error',
		'max-lines-per-function': [
			'error',
			{
				max: 30,
				skipBlankLines: true,
				skipComments: true
			}
		],
		'require-await': 'error'
	},
	overrides: [
		{
			files: ['*.spec.js'],
			rules: {
				'max-lines-per-function': 'off'
			}
		}
	]
}
