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
    'playwright-report',
    'test-results',
    'blob-report',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // La carga inicial de datos y la sincronización con localStorage se hacen
      // en efectos; la regla experimental de React Compiler no aplica aquí.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // AuthContext exporta el provider y el hook; es un patrón válido.
    files: ['src/context/**/*.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
