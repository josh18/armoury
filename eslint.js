module.exports = {
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
    ],
    ignorePatterns: ['dist'],
    rules: {
        // 'arrow-parens': ['warn', 'as-needed'],
        // 'comma-dangle': ['warn', 'always-multiline'],
        'import/default': 'off',
        'import/order': [
            'warn',
            {
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
                groups: [
                    ['builtin', 'external'],
                    ['internal'],
                    ['index', 'sibling', 'parent'],
                    ['type'],
                ],
                pathGroups: [
                    {
                        pattern: '*.css',
                        group: 'parent',
                        patternOptions: { matchBase: true },
                        position: 'after',
                    },
                ],
                'newlines-between': 'always',
            },
        ],
        'import/no-unresolved': 'off',
        'no-empty': [
            'warn',
            {
                allowEmptyCatch: true,
            },
        ],
        // 'no-irregular-whitespace': ['warn', {
        //     skipStrings: false,
        // }],
        'no-unused-vars': ['warn'],
        'prefer-const': [
            'warn',
            {
                destructuring: 'all',
            },
        ],
        // 'quote-props': ['warn', 'as-needed'],
        'sort-imports': [
            'warn',
            {
                ignoreCase: true,
                ignoreDeclarationSort: true,
            },
        ],
    },
    overrides: [
        {
            files: ['*.js'],
            env: {
                node: true,
            },
        },
        {
            files: ['*.ts', '*.tsx'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: 'tsconfig.json',
            },
            plugins: ['@typescript-eslint'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                'plugin:import/typescript',
            ],
            rules: {
                '@typescript-eslint/array-type': [
                    'warn',
                    {
                        default: 'array-simple',
                    },
                ],
                // '@typescript-eslint/consistent-type-definitions': [
                //     'warn',
                //     'interface',
                // ],
                '@typescript-eslint/explicit-member-accessibility': [
                    'warn',
                    {
                        accessibility: 'no-public',
                    },
                ],
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/member-delimiter-style': 'warn',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-floating-promises': 'off',
                '@typescript-eslint/no-misused-promises': [
                    'error',
                    {
                        checksVoidReturn: false,
                    },
                ],
                '@typescript-eslint/no-non-null-assertion': 'off',
                '@typescript-eslint/no-shadow': [
                    'error',
                    {
                        ignoreOnInitialization: true,
                    },
                ],
                '@typescript-eslint/no-this-alias': 'off',
                '@typescript-eslint/no-unsafe-argument': 'off',
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
                '@typescript-eslint/no-unsafe-return': 'off',
                '@typescript-eslint/no-unused-vars': [
                    'warn',
                    {
                        destructuredArrayIgnorePattern: '^_',
                        ignoreRestSiblings: true,
                    },
                ],
                '@typescript-eslint/no-useless-constructor': 'warn',
                // '@typescript-eslint/quotes': ['warn', 'single', {
                //     allowTemplateLiterals: true,
                // }],
                // '@typescript-eslint/semi': 'warn',
                '@typescript-eslint/unbound-method': 'off',
            },
        },
    ],
};
