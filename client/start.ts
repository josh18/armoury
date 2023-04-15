import { webpack } from 'webpack';
import WebpackDevServer, { Configuration } from 'webpack-dev-server';

import { clearConsole, color, formatError, formatWarning } from './format';
import { loadOptions, paths } from './options';
import { config } from './webpack.config';

async function start() {
    const options = await loadOptions();

    const port = options.start?.port ?? 8080;

    const compiler = webpack({
        ...config({
            ...options,
            isProduction: false,
        }),
        infrastructureLogging: {
            level: 'none',
        },
        stats: 'none',
    });

    const serverConfig: Configuration = {
        static: [...(options.start?.staticPaths ?? []), paths.public],
        proxy: {
            '/api': {
                target: 'http://localhost',
                ws: true,
            },
        },
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
        },
        host: '0.0.0.0',
        port,
        historyApiFallback: true,
    };

    compiler.hooks.done.tap('start.ts', (stats) => {
        const url = `http://localhost:${port}`;

        clearConsole();
        console.log(`Serving on ${color.cyan(url)}`);
        console.log();

        const info = stats.toJson({
            all: false,
            errors: true,
            warnings: true,
        });

        if (info.errors?.length) {
            console.log(color.red('👎 Bad'));
            console.log();
            console.log(info.errors.map(formatError).join('\n\n'));
        } else if (info.warnings?.length) {
            console.log(color.yellow('🤔 Maybe?'));
            console.log();
            console.log(info.warnings.map(formatWarning).join('\n\n'));
        } else {
            console.log(color.green('👍 Good'));
        }

        console.log();
    });

    const server = new WebpackDevServer(serverConfig, compiler);
    server.start();
}

start();
