import { Config } from '@stencil/core';
import { OutputTargetDist } from '@stencil/core/dist/declarations/output-targets';
import { sass } from '@stencil/sass';

const targetDist: OutputTargetDist = {
    copy: [
        {
            src: 'browserconfig.xml',
        },
        {
            src: 'CNAME',
        },
    ],
    dir: 'dist',
    empty: false,
    type: 'www',
};

export const config: Config = {
    outputTargets: [targetDist],
    globalStyle: 'src/global/app.css',
    plugins: [sass()],
};
