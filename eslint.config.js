// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      '.expo/**',
      'build/**',
      'coverage/**',
      'dist/**',
      'ios/**',
      'website/**',
    ],
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
