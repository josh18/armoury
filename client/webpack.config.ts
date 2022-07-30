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

function isTruthy<T>(value: false | T): value is T {
    return !!value === true;
}

class HtmlVariablesPlugin {
    constructor(
        private replacementVariables: Record<string, any>,
    ) { }

    apply(compiler: Compiler) {
        compiler.hooks.compilation.tap('HtmlVariablesPlugin', compilation => {
            HtmlWebpackPlugin
                .getHooks(compilation)
                .afterTemplateExecution.tap('HtmlVariablesPlugin', data => {
                    Object.entries(this.replacementVariables).forEach(([key, value]) => {
                        data.html = data.html.replaceAll(`%${key}%`, value.toString());
                    });

                    return data;
                });
        });
    }
}

const swSrc = path.resolve(paths.src, 'serviceWorker.ts');

export interface ConfigOptions extends ClientOptions {
    isProduction: boolean;
}

export function config({ analyze = false, isProduction, replacementVariables }: ConfigOptions): Configuration {
    const isDevelopment = !isProduction;

    return {
        mode: isProduction ? 'production' : 'development',
        bail: isProduction,
        devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
        entry: path.resolve(paths.src, 'index.tsx'),
        output: {
            path: paths.dist,
            filename: 'static/js/[name].[contenthash:8].js',
            chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
            devtoolModuleFilenameTemplate: isProduction
                ? (info: any) => path
                    .relative(paths.src, info.absoluteResourcePath)
                    .replace(/\\/g, '/')
                : (info: any) => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
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
        },
        module: {
            rules: [{
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
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
                            [
                                '@babel/preset-react',
                                {
                                    development: isDevelopment,
                                    runtime: 'automatic',
                                    importSource: '@emotion/react',
                                },
                            ],
                            '@babel/preset-typescript',
                        ],
                        plugins: [
                            isDevelopment && 'react-refresh/babel',
                            '@emotion',
                        ].filter(Boolean),
                    },
                },
            }, {
                test: /\.css$/,
                use: [
                    isDevelopment && 'style-loader',
                    isProduction && MiniCssExtractPlugin.loader,
                    'css-loader',
                ].filter(isTruthy),
            }],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(paths.public, 'index.html'),
            }),
            !!replacementVariables && new HtmlVariablesPlugin(replacementVariables),
            isDevelopment && new ReactRefreshWebpackPlugin({ overlay: false }),
            isProduction && new MiniCssExtractPlugin({
                filename: 'static/css/[name].[contenthash:8].css',
                chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),
            isProduction && existsSync(swSrc) && new InjectManifest({
                swSrc,
                exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
            }),
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    configFile: paths.tsconfig,
                },
                logger: 'webpack-infrastructure',
            }),
            analyze && new BundleAnalyzerPlugin(),
            !!replacementVariables && new EnvironmentPlugin(replacementVariables),
        ].filter(isTruthy),
    };
}
