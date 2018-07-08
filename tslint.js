module.exports = {
    extends: [
        'tslint:latest',
        'tslint-react',
        'tslint-eslint-rules',
        'tslint-sonarts',
        'tslint-plugin-prettier',
        'tslint-config-prettier',
    ],
    linterOptions: {
        exclude: ['src/components.d.ts'],
    },

    rules: {
        prettier: true,

        // See links for details:
        // https://palantir.github.io/tslint/rules/
        // https://github.com/buzinas/tslint-eslint-rules#rules-copied-from-the-eslint-website
        //
        // Possible Errors
        'no-conditional-assignment': true,
        'no-console': true,
        'no-constant-condition': true,
        'no-control-regex': true,
        'no-debugger': true,
        'no-duplicate-case': true,
        'no-empty': true,
        'no-empty-character-class': true,
        'no-ex-assign': true,
        'no-extra-boolean-cast': true,
        'no-extra-semi': true,
        'no-implicit-dependencies': [true],
        'no-inner-declarations': true,
        'no-invalid-regexp': true,
        'no-regex-spaces': true,
        'no-unexpected-multiline': true,
        'no-unsafe-finally': true,
        'ter-no-irregular-whitespace': true,
        'ter-no-sparse-arrays': true,
        'trailing-comma': [
            true,
            {
                esSpecCompliant: true,
                multiline: {
                    arrays: 'always',
                    functions: 'never',
                    objects: 'always',
                    typeLiterals: 'ignore',
                },
            },
        ],
        'use-isnan': true,
        'valid-jsdoc': true,
        'valid-typeof': true,

        // Best Practices
        ban: [true, ['alert']],
        curly: 'all',
        'cyclomatic-complexity': ['warn', { max: 2 }],
        forin: true,
        'label-position': true,
        'no-arg': true,
        'no-construct': true,
        'no-duplicate-variable': true,
        'no-empty': true,
        'no-eval': true,
        'no-invalid-this': true,
        'no-magic-numbers': true,
        'no-multi-spaces': true,
        'no-string-throw': true,
        'no-submodule-imports': [true, '@stencil/core'],
        'no-switch-case-fall-through': true,
        'no-unused-expression': true,
        'no-unused-expression': true,
        radix: true,
        'switch-default': true,
        'ter-no-proto': true,
        'ter-no-script-url': true,
        'ter-no-self-compare': true,
        'triple-equals': true,

        // Variables
        'no-shadowed-variable': true,
        'no-unused-variable': true,

        // Style
        'arrow-return-shorthand': false,
        'object-literal-sort-keys': false,

        // ECMAScript 6
        'no-var-keyword': true,
        'object-literal-shorthand': [true, 'never'],
        'prefer-const': true,
        'ter-arrow-body-style': [true, 'always'],
        'ter-prefer-arrow-callback': [true],

        // See link for details:
        // https://www.npmjs.com/package/tslint-react#rules
        //
        // JSX

        // It seems like `jsx-key` is only relevant in React.
        // Components built in Stencil will redraw the whole
        // component on any change in the data.
        'jsx-key': false,

        'jsx-no-bind': false,
        'jsx-no-lambda': false,
        'jsx-no-multiline-js': false,
        'jsx-no-string-ref': true,
        'jsx-self-close': true,
        'jsx-use-translation-function': false,
        'jsx-wrap-multiline': true,
    },
};
