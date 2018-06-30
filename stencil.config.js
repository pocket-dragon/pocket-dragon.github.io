const sass = require('@stencil/sass');

exports.config = {
    globalStyle: 'src/global/app.css',
    plugins: [
        sass()
    ],
    outputTargets: [{ // prod-build
        dir: 'docs',
        type: 'www'
    }]
};

exports.devServer = {
  root: 'docs',
  watchGlob: '**/**'
};
