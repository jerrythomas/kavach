module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2022,
    allowImportExportEverywhere: false,
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  ignorePatterns: [
    '.vercel',
    '.turbo',
    '.svelte-kit',
    'node_modules',
    'dist/**/*.js',
    'coverage',
  ],
}
