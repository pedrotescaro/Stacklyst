const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
module.exports = defineConfig([
  expo,
  { ignores: ['android/**', 'ios/**', 'dist/**', 'src/editor/document.generated.ts'] },
  { rules: { '@typescript-eslint/no-explicit-any': 'off', 'react-hooks/exhaustive-deps': 'warn', 'import/no-unresolved': 'off' } },
]);
