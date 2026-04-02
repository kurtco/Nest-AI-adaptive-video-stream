/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  // CLAVE: Evita que el linter intente usar TS en este mismo archivo
  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules'], 
  rules: {
  },
};