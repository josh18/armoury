module.exports = {
    extends: ['./eslint.js'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    overrides: {
        files: ['*.tsx'],
        extends: [
            'plugin:react/recommended',
            'plugin:react-hooks/recommended',
            'plugin:react/jsx-runtime',
        ],
        rules: {
            'react/prop-types': 'off',
        },
    },
};
