const sass = require('@stencil/sass');

exports.config = {
    copy: [
        { src: '../_config.yml', dest: '_config.yml' },
        { src: '../.nojekyll', dest: '.nojekyll' }
    ],
    globalStyle: 'src/global/app.css',
    plugins: [
        sass()
    ],
    outputTargets: [{
        dir: 'docs',
        type: 'www'
    }]
};
