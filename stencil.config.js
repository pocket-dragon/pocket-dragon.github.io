/* eslint-env es6 */

const sass = require('@stencil/sass');

exports.config = {
    copy: [
        {
            src: 'browserconfig.xml',
        },
        {
            src: 'CNAME',
        },
        {
            src: '../node_modules/showdown/dist/showdown.min.js',
            dest: 'assets/showdown.min.js',
        },
        {
            src: '../node_modules/showdown/dist/showdown.min.js.map',
            dest: 'assets/showdown.min.js.map',
        },
    ],
    globalStyle: 'src/global/app.css',
    plugins: [sass()],
    outputTargets: [
        {
            dir: 'dist',
            empty: false,
            type: 'www',
        },
    ],
};

exports.devServer = {
    root: 'dist',
    watchGlob: '**/**',
};
