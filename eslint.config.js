import antfu from '@antfu/eslint-config'

export default antfu({}, {
  files: ['**/*.ts'],
  rules: {
    'no-invalid-this': 'off',
    '@typescript-eslint/no-invalid-this': 'off',
  },
})
