const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const projectRules = require('./tooling/eslint-rules.cjs');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/**', 'coverage/**', '.expo/**', 'assets/**'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { project: projectRules },
    rules: { 'project/boundaries': 'error' },
  },
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/bootstrap/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    ignores: ['**/*.test.ts', '**/messages/**'],
    rules: { 'project/design-tokens': 'error' },
  },
]);
