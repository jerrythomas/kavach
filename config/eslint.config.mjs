import eslintPluginSvelte from 'eslint-plugin-svelte'

export default [
  ...eslintPluginSvelte.configs['flat/recommended'],
  {
    ignores: [
      '**/spec/error/*.js',
      '**/fixtures/error/*.js',
      '**/fixtures/**/invalid.js',
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.svelte-kit/',
      '**/build/**',
      '**/.vercel/**',
      'packages/archive',
      'packages/icons/lib',
      '**/app.d.ts',
      '.worktrees/**',
      'sites/learn/**',
      'packages/vite/src/templates/**',
      'sites/demo/playwright.config.js',
      'sites/demo/convex/_generated/**'
    ]
  },
  {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        TouchEvent: 'readonly',
        CustomEvent: 'readonly',
        Touch: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        Event: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        process: 'readonly',
        global: 'readonly',
        __APP_VERSION__: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Buffer: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn'
    },
    rules: {
      complexity: ['warn', 5],
      'max-depth': ['error', 3],
      'max-params': ['warn', 4],
      'no-console': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      eqeqeq: 'error',
      'no-eq-null': 'error',
      'no-implicit-coercion': 'error',
      'no-use-before-define': ['error', { functions: false }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'max-lines-per-function': [
        'warn',
        {
          max: 30,
          skipBlankLines: true,
          skipComments: true
        }
      ],
      'no-return-await': 'error',
      'require-await': 'error'
    },
    files: ['**/*.js']
  },
  {
    files: ['packages/cli/**/*.js'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['**/*.spec.js', '**/*.spec.svelte.js', '**/spec/mocks/**'],
    languageOptions: {
      globals: {
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        test: 'readonly',
        suite: 'readonly'
      }
    },
    rules: {
      'max-lines-per-function': 'off'
    }
  },
  {
    files: ['**/*.svelte'],
    rules: {
      'svelte/no-navigation-without-resolve': 'off'
    }
  }
]
