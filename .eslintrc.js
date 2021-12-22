'use strict';


module.exports = {
    'plugins': [
        'wdio',
        'import',
        'mocha',
        // https://github.com/dangreenisrael/eslint-plugin-jest-formatting/tree/master/docs/rules
        'jest-formatting'
    ],
    'extends': [
        'plugin:wdio/recommended',
        // https://eslint.org/docs/rules/
        'eslint:recommended',
        // https://github.com/lo1tuma/eslint-plugin-mocha/tree/master/docs/rules
        'plugin:mocha/recommended',
        require.resolve('cjs-eslint')
    ],
    env: {
        es2021: true,
        mocha: true,
        node: true
    },
    parserOptions: {
        ecmaVersion: 2021,
        ecmaFeatures: {
            experimentalObjectRestSpread: true
        }
    },

    rules: {
        'complexity': ['error', 25],
        'no-invalid-this': 0,
        'consistent-return': 0,
        'no-await-in-loop': 0,
        'no-return-await': 0,
        'class-methods-use-this': 0,
        'no-unused-vars': 0,
        'mocha/no-mocha-arrows': 0,
        'one-var': 0,
        'mocha/no-skipped-tests': 'error',
        'mocha/no-exclusive-tests': 'error',
        'strict': ['error', 'global'],
        'no-console': ['error', {allow: ['warn', 'error']}],
        'padding-line-between-statements': [
            'error',
            {blankLine: 'always', prev: '*', next: ['directive', 'return', 'export', 'cjs-export', 'try', 'function']},
            {blankLine: 'always', prev: ['directive', 'export', 'cjs-export', 'try', 'function'], next: '*'},
            {blankLine: 'always', prev: 'directive', next: '*'},
            {blankLine: 'always', prev: '*', next: ['const', 'let', 'var', 'export']},
            {blankLine: 'always', prev: ['const', 'let', 'var', 'export'], next: '*'},
            {blankLine: 'any', prev: ['const', 'let', 'var', 'export'], next: ['const', 'let', 'var', 'export']}
        ],
        quotes: ['error', 'single', {allowTemplateLiterals: true, avoidEscape: true}],
        'max-statements': ['warn', 70, {ignoreTopLevelFunctions: false}],
        'quote-props': ['error', 'as-needed', {keywords: true, unnecessary: false}],
        'no-shadow': ['error', {allow: ['done']}],
        'import/no-unresolved': [2, {'commonjs': true, 'amd': false, 'caseSensitive': true}],
        'jest-formatting/padding-around-all': ['error'],
        'max-len': [
            'error', {
                'code': 150,
                'ignoreComments': true,
                'ignoreUrls': true,
                'ignoreStrings': true,
                'ignoreTemplateLiterals': true,
                'ignoreRegExpLiterals': true
            }
        ],
        'no-empty': ['error', {'allowEmptyCatch': true}]
    }
};
