module.exports = {
  extends: [
    'next/core-web-vitals',
    // "eslint:recommended",
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'simple-import-sort', 'unused-imports'],
  root: true,
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    // Enforce maximum file length of 250 lines
    'max-lines': [
      'error',
      {
        max: 350,
        skipBlankLines: true,
        skipComments: true
      }
    ],
    // Other rules can be added here
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'unused-imports/no-unused-imports': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "CallExpression[callee.name='useQuery'] > ObjectExpression > Property[key.name='queryKey'][value.type='ArrayExpression']",
        message: 'queryKey must not be an array literal. Use a function call to generate the query key.',
      },
      {
        selector:
          "CallExpression[callee.name='useQuery'] > ObjectExpression > Property[key.name='queryKey'][value.type='Literal']",
        message: 'queryKey must not be a string literal. Use a function call to generate the query key.',
      },
    ],
  }
};
