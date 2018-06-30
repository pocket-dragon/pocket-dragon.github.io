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
    }]
};

exports.devServer = {
  root: 'docs',
  watchGlob: '**/**'
};
