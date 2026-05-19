// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Vue
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/require-default-prop': 'off',
    'vue/component-tags-order': ['error', {
      order: ['script', 'template', 'style'],
    }],

    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    // consistent-type-imports 需要 typed linting，改用 @typescript-eslint/no-import-type-side-effects
    // 强制 import type 语法通过 tsconfig 的 verbatimModuleSyntax 保证
    '@typescript-eslint/no-import-type-side-effects': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',

    // 导入顺序
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
    }],
  },
})
