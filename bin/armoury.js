#! /usr/bin/env node

const { resolve } = require('path');

const script = process.argv[2];

require('ts-node').register({
    project: resolve(__dirname, '../client/tsconfig.json'),
});

switch (script) {
    case 'build':
        require('../client/build.ts');
        break
    case 'start':
        require('../client/start.ts');
        break
    default:
        throw new Error(`Unknown script "${script}"`);
}
