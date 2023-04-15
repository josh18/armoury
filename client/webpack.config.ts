import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { existsSync } from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { Compiler, Configuration, EnvironmentPlugin } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { InjectManifest } from 'workbox-webpack-plugin';

import { ClientOptions, paths } from './options';
import { postcssPlugin } from './postcssPlugin';

function isTruthy<T>(value: false | undefined | T): value is T {
    return !!value === true;
}

class HtmlVariablesPlugin {
    constructor(private replacementVariables: Record<string, any>) {}

    apply(compiler: Compiler) {
        compiler.hooks.compilation.tap('HtmlVariablesPlugin', (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tap(
                'HtmlVariablesPlugin',
                (data) => {
                    Object.entries(this.replacementVariables).forEach(
                        ([key, value]) => {
                            value ??= '';

                            data.html = data.html.replaceAll(
                                `%${key}%`,
                                value.toString(),
                            );
                        },
                    );

                    return data;
                },
            );
        });
    }
}

const swSrc = path.resolve(paths.src, 'serviceWorker.ts');

export interface ConfigOptions extends ClientOptions {
    isProduction: boolean;
}

export function config({
    isProduction,
    build,
    replacementVariables,
    react = true,
}: ConfigOptions): Configuration {
    const isDevelopment = !isProduction;

    let publicPath = '/';
    if (isProduction && build?.appPath) {
        publicPath = build.appPath;

        if (!publicPath.endsWith('/')) {
            publicPath += '/';
        }
    }

    return {
        mode: isProduction ? 'production' : 'development',
        bail: isProduction,
        devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
        entry: path.resolve(paths.src, react ? 'index.tsx' : 'index.ts'),
        output: {
            path: paths.dist,
            filename: 'static/js/[name].[contenthash:8].js',
            chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
            devtoolModuleFilenameTemplate: isProduction
                ? (info: any) =>
                      path
                          .relative(paths.src, info.absoluteResourcePath)
                          .replace(/\\/g, '/')
                : (info: any) =>
                      path
                          .resolve(info.absoluteResourcePath)
                          .replace(/\\/g, '/'),
        },
        cache: {
            type: 'filesystem',
            buildDependencies: {
                defaultWebpack: ['webpack/lib/'],
                config: [__filename],
                tsconfig: [paths.tsconfig],
            },
        },
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        ecma: 2020,
                    },
                }),
                new CssMinimizerPlugin(),
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            alias: {
                assets: paths.assets,
            },
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                cacheDirectory: true,
                                presets: [
                                    [
                                        '@babel/preset-env',
                                        {
                                            targets: [
                                                'last 1 chrome version',
                                                'last 1 firefox version',
                                            ],
                                        },
                                    ],
                                    react && [
                                        '@babel/preset-react',
                                        {
                                            development: isDevelopment,
                                            runtime: 'automatic',
                                            importSource: '@emotion/react',
                                        },
                                    ],
                                    '@babel/preset-typescript',
                                ].filter(Boolean),
                                plugins: [
                                    react &&
                                        isDevelopment &&
                                        'react-refresh/babel',
                                    react && '@emotion',
                                    !react && [
                                        '@babel/plugin-transform-react-jsx',
                                        {
                                            runtime: 'automatic',
                                            importSource: path.resolve(
                                                paths.root,
                                                'jsx',
                                            ),
                                            useSpread: true,
                                        },
                                    ],
                                ].filter(Boolean),
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    use: [
                        isDevelopment && 'style-loader',
                        isProduction && MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    mode: (resourcePath: string) => {
                                        if (
                                            resourcePath.endsWith('global.css')
                                        ) {
                                            return 'global';
                                        }

                                        return 'pure';
                                    },
                                    localIdentName: isDevelopment
                                        ? '[path][name]__[local]__[hash:base64:5]'
                                        : '[local]__[hash:base64]',
                                },
                            },
                        },
                        !react && {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    parser: 'postcss-scss',
                                    plugins: [postcssPlugin, 'postcss-nested'],
                                },
                            },
                        },
                    ].filter(isTruthy),
                },
                // {
                //     test: /\.scss$/,
                //     use: [
                //         isDevelopment && 'style-loader',
                //         isProduction && MiniCssExtractPlugin.loader,
                //         {
                //             loader: 'css-loader',
                //             options: {
                //                 modules: {
                //                     mode: (resourcePath: string) => {
                //                         if (
                //                             resourcePath.endsWith('global.scss')
                //                         ) {
                //                             return 'global';
                //                         }

                //                         return 'pure';
                //                     },
                //                     localIdentName: isDevelopment
                //                         ? '[path][name]__[local]__[hash:base64:5]'
                //                         : '[local]__[hash:base64]',
                //                 },
                //             },
                //         },
                //         'sass-loader',
                //         path.resolve(__dirname, '../loaders/'),
                //     ].filter(isTruthy),
                // },
                {
                    test: /\.(png|jpe?g|gif|woff2|webp)$/i,
                    type: 'asset/resource',
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(paths.public, 'index.html'),
                publicPath,
            }),
            replacementVariables &&
                new HtmlVariablesPlugin(replacementVariables),
            react &&
                isDevelopment &&
                new ReactRefreshWebpackPlugin({ overlay: false }),
            isProduction &&
                new MiniCssExtractPlugin({
                    filename: 'static/css/[name].[contenthash:8].css',
                    chunkFilename:
                        'static/css/[name].[contenthash:8].chunk.css',
                }),
            isProduction &&
                existsSync(swSrc) &&
                new InjectManifest({
                    swSrc,
                    exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
                }),
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    configFile: paths.tsconfig,
                    configOverwrite: {
                        include: ['src/**/*'],
                    },
                },
                logger: 'webpack-infrastructure',
            }),
            isProduction && build?.analyze && new BundleAnalyzerPlugin(),
            replacementVariables && new EnvironmentPlugin(replacementVariables),
        ].filter(isTruthy),
    };
}
