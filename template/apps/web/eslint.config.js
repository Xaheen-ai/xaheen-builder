import { apps } from '@xaheen/eslint-config';

export default [
  ...apps,
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**'],
  },
];
