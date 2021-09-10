const webpack = require('webpack');
const path = require('path');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CompressionPlugin = require("compression-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const express = require('express');

module.exports = {
    devServer: {
        host: "0.0.0.0",
        hot: true,
        disableHostCheck: true, /*host校验关闭*/
        contentBase: './dist',
        port: 3333,
        after: function (app, server, compiler) {
        },
        before: function (app, server, compiler) {
            // console.log("before",path.resolve(process.cwd(), './assets'),app);
            app.use(express.static(path.resolve(process.cwd(), './assets')));
        }
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    "presets": [
                        [
                            "@babel/preset-env",
                            {
                                "loose": true,
                                "modules": false,
                                "targets": {
                                    "browsers": "last 2 chrome versions"
                                }
                            }
                        ],
                        "@babel/preset-react"
                    ],
                    "plugins": [ ['@babel/plugin-proposal-decorators', { legacy: true }], ["@babel/plugin-proposal-class-properties", { loose: true }]]
                }
            }],
        },
        {
            test: /\.css$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        sourceMap: true
                    }
                }
            ]
        },
        {
            test: /\.(png|jpg|gif)$/,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 1,
                        name: '[name].[hash].[ext]',
                        esModule: false
                    },
                },
            ],
        },
        {
            test: /\.ttf$/,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 1,
                        name: '[name].[hash].[ext]',
                        esModule: false
                    },
                },
            ],
        },
        ]
    },
    optimization: {
        moduleIds: "named"
    },
    // externals: {
    //     "react": "react",
    //     "react-dnd": "react-dnd",
    //     "react-dom": "react-dom",
    //     "react-dnd-html5-backend": "react-dnd-html5-backend",
    //     "lodash": "lodash",
    //     "superagent": "superagent",
    //     "@alifd/next": "@alifd/next"
    // },
    output: {
        // filename: 'MCPBankH5Bridge.js',
        chunkFilename: '[name].[hash].js',
        path: path.resolve(__dirname, 'lib'),
        library: 'MCPBankH5Bridge',
        libraryTarget: 'umd'
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    plugins: [
        new webpack.DefinePlugin({
            '__IS_WEB__': true,
            '__DEV__': true,
            process: { env: {} }
        }),
        // new UnusedWebpackPlugin({
        //   directories: [__dirname],
        //   root: __dirname,
        //   exclude: ['node_modules','output','output-bundle'],
        // }),
        new HtmlWebpackPlugin({
            template: './template.html',
            filename: 'index.html'
        })],
    // plugins: [new CompressionPlugin()],
    optimization: {
        minimize: true,
        // minimizer: [new UglifyJsPlugin()],
    },
    resolve: {
        alias: {
            // 'react-native$': 'react-native-web',
            //   'Assets': path.resolve(__dirname, 'assets2/index'),
            //   'Theme': path.resolve(__dirname, 'theme/index'),
            '@': path.resolve(__dirname, 'web_src'),
        },
        extensions: ['.web.js', '.js', '.jsx']
    }
};