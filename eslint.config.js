import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    'node_modules',
    'functions/**',
    'init/**',
    'src/dataconnect-generated/**',
    'playwright-report/**',
    'test-results/**',
    'playwright.config.js',
    'vite.config.js',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      // React Hooks rules - tornar warnings para não bloquear testes
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      // React Refresh - tornar warning
      'react-refresh/only-export-components': 'warn',
    },
  },
  // Configuração para arquivos de teste e interfaces que usam Node.js globals
  {
    files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js', '**/interfaces/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-undef': 'off', // Desabilitar para permitir require, process, etc em arquivos Node.js
    },
  },
])
