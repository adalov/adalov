import babelParser from '@babel/eslint-parser';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import perfectionist from 'eslint-plugin-perfectionist';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const classMemberGroups = [
    'index-signature',

    [
        'public-static-property',
        'public-static-function-property',
        'public-static-accessor-property'
    ],
    [
        'public-static-readonly-property',
        'public-static-readonly-function-property'
    ],
    [
        'public-property',
        'public-function-property',
        'public-accessor-property'
    ],
    [
        'public-readonly-property',
        'public-readonly-function-property'
    ],

    [
        'protected-static-property',
        'protected-static-function-property',
        'protected-static-accessor-property'
    ],
    [
        'protected-static-readonly-property',
        'protected-static-readonly-function-property'
    ],
    [
        'protected-property',
        'protected-function-property',
        'protected-accessor-property'
    ],
    [
        'protected-readonly-property',
        'protected-readonly-function-property'
    ],

    [
        'private-static-property',
        'private-static-function-property',
        'private-static-accessor-property'
    ],
    [
        'private-static-readonly-property',
        'private-static-readonly-function-property'
    ],
    [
        'private-property',
        'private-function-property',
        'private-accessor-property'
    ],
    [
        'private-readonly-property',
        'private-readonly-function-property'
    ],

    'static-block',

    'public-constructor',
    'protected-constructor',
    'private-constructor',

    [
        'public-static-get-method',
        'public-static-set-method',
        'public-static-method'
    ],
    [
        'public-get-method',
        'public-set-method',
        'public-method'
    ],

    [
        'protected-static-get-method',
        'protected-static-set-method',
        'protected-static-method'
    ],
    [
        'protected-get-method',
        'protected-set-method',
        'protected-method'
    ],

    [
        'private-static-get-method',
        'private-static-set-method',
        'private-static-method'
    ],
    [
        'private-get-method',
        'private-set-method',
        'private-method'
    ],

    'unknown'
];

export default [
    {
        ignores: [
            '**/*.d.ts',
            '**/.build/**',
            '**/.test-build/**',
            '**/.coverage/**',
            '.dist/**'
        ]
    },
    js.configs.recommended,
    {
        files: ['scripts/**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                process: 'readonly',
                require: 'readonly'
            }
        }
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                sourceType: 'module',
                babelOptions: {
                    parserOpts: {
                        plugins: [
                            'typescript',
                            'decorators-legacy'
                        ]
                    }
                }
            }
        },
        plugins: {
            '@stylistic': stylistic,
            perfectionist,
            'simple-import-sort': simpleImportSort
        },
        rules: {
            'no-dupe-class-members': 'off',
            'no-param-reassign': [
                'error',
                {
                    props: false
                }
            ],
            'no-undef': 'off',
            'no-unused-vars': 'off',
            '@stylistic/max-len': [
                'error',
                {
                    code: 80,
                    ignoreUrls: true,
                    tabWidth: 4
                }
            ],
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'perfectionist/sort-classes': [
                'error',
                {
                    type: 'unsorted',
                    partitionByComment: false,
                    partitionByNewLine: false,
                    newlinesBetween: 'ignore',
                    groups: classMemberGroups
                }
            ]
        }
    }
];
