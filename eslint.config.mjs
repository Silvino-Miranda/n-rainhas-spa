// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'out-tsc/**',
      '.angular/**',
      'public/**',
      'docs/**',
      '.aiox-core/**',
      '.aiox/**',
      '.claude/**',
      '.codex/**',
      '.agent/**',
      '.cursor/**',
      '.gemini/**',
      '.antigravity/**',
      '.github/**',
      'vitest.config.ts',
      '**/*.config.{js,mjs,cjs,ts}',
      'src/environments/**'
    ]
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' }
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' }
      ],
      '@angular-eslint/no-output-native': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/array-type': 'off',
      'no-console': ['warn', { allow: ['warn', 'error', 'debug'] }]
    }
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility
    ],
    rules: {}
  },
  {
    files: ['**/*.worker.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off'
    }
  }
);
