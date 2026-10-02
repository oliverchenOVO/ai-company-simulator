import js from '@eslint/js';
import ts from 'typescript-eslint';
export default ts.config(
  { ignores: ['node_modules/**', 'dist/**', 'dist-electron/**', 'release/**', 'test-results/**', 'playwright-report/**'] },
  js.configs.recommended, ...ts.configs.recommended,
  { files: ['**/*.ts', '**/*.tsx'], rules: { '@typescript-eslint/no-explicit-any': 'error' } },
  { files: ['packages/simulation/**/*.ts'], rules: {
    'no-restricted-properties': ['error', { object: 'Math', property: 'random', message: 'Use contextual deterministic RNG.' }, { object: 'Date', property: 'now', message: 'Use simulation time.' }]
  } },
  { files: ['**/*.mjs'], languageOptions: { globals: { process: 'readonly', console: 'readonly' } } }
);
