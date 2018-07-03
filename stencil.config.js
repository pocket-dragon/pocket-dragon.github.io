const sass = require('@stencil/sass');

exports.config = {
    copy: [{
        src: 'browserconfig.xml'
    }, {
        src: 'CNAME'
    }],
    globalStyle: 'src/global/app.css',
    plugins: [
        sass()
    ],
    outputTargets: [{
        dir: 'dist',
        empty: false,
        type: 'www'
    }]
};

exports.devServer = {
  root: 'dist',
  watchGlob: '**/**'
};
