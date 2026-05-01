import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // 1. 全局忽略
  { 
    ignores: [
      '**/dist/**', 
      '**/node_modules/**', 
      '**/build/**',
      '**/temp/**',
      'scripts/**',
    ] 
  },
  
  // 2. 基础配置 (适用于所有 TS 文件)
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
    },
  },

  // 3. 前端专用配置 (React + Browser)
  {
    files: ['frontend/src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // 4. 后端专用配置 (Node.js)
  {
    files: ['backend/src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // 在这里可以添加后端特有的规则，例如：
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // 5. Electron 专用配置 (JS 文件)
  {
    files: ['electron/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser, // Electron 有时需要两者
      },
    },
  }
)
