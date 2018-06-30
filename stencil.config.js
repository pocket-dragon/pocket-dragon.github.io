const sass = require('@stencil/sass');

exports.config = {
    copy: [
        { src: '../_config.yml', dest: '_config.yml' }
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
