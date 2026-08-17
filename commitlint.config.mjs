const commitTypes = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'test',
];

const commitScopes = ['cli', 'common', 'core', 'http', 'metadata', 'repo'];

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', commitTypes],
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', commitScopes],
    'scope-case': [2, 'always', 'lower-case'],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
    'header-max-length': [2, 'always', 100],
  },
};
