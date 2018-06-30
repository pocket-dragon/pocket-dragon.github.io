const sass = require('@stencil/sass');

exports.config = {
    globalStyle: 'src/global/app.css',
    plugins: [
        sass()
    ],
    outputTargets: [{
        baseUrl: '/pocketdragon',
        dir: 'docs',
        type: 'www'
    }, {
        dir: 'www',
        type: 'www'
    }]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
};
