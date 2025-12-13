module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      // Test files and test utilities
      files: ['**/*.test.{js,jsx}', '**/tests/**/*.{js,jsx}', '**/testUtils.jsx', '**/setupTests.js'],
      env: {
        node: true,
        browser: true,
        es2020: true,
      },
      globals: {
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    {
      // Config files
      files: ['*.config.{js,mjs,cjs}', 'vite.config.js', 'vitest.config.js'],
      env: {
        node: true,
      },
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  ],
}

