import { Config } from '@stencil/core';
import { OutputTargetDist } from '@stencil/core/dist/declarations/output-targets';
import { sass } from '@stencil/sass';

const targetDist: OutputTargetDist = {
    dir: 'dist',
    empty: false,
    type: 'www',
};

export const config: Config = {
    copy: [
        {
            src: 'browserconfig.xml',
        },
        {
            src: 'CNAME',
        },
    ],
    outputTargets: [targetDist],
    globalStyle: 'src/global/app.css',
    plugins: [sass()],
};
