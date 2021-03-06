/*
 * Copyright 2019 Firespring, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const dotenv = require('dotenv');
dotenv.config({path: `${__dirname}/../../../.env`});

const path = require('path');
const webpack = require('webpack');
const BrowserSyncSpa = require('browser-sync-middleware-spa');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FetchDynamicContent = require('./../bin/fetch-dynamic-content');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');

module.exports = function () {
	const env = process.env.NODE_ENV || 'development';
	const config = {
		mode: env,
		module: {
			rules: [
				{
					test: /\.vue$/,
					loader: 'vue-loader',
					exclude: /node_modules/,
					options: {
						loaders: {
							js: 'babel-loader'
						}
					}
				},
				{
					test: /\.(jpe?g|png|gif|svg)$/i,
					loader: 'file-loader?name=assets/img/[name].[ext]'
				},
				{
					test: /\.css$/,
					loader: 'style-loader!css-loader'
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					loader: 'babel-loader'
				},
			]
		},
		resolve: {
			alias: {
				'vue$': 'vue/dist/vue.esm.js'
			}
		},
		target: 'web',
		entry: [
			'./src/public-pages/app.js'
		],
		output: {
			path: path.resolve(__dirname, './../build/public-pages'),
			filename: 'bundle.js',
			publicPath: '/',
		},
		devtool: 'hidden-source-map',
		plugins: [
			new webpack.DefinePlugin({
				'process.env': {
					NODE_ENV: `"${process.env.NODE_ENV}"`,
				}
			}),
			new webpack.ProvidePlugin({
				$: 'jquery',
				jQuery: 'jquery',
				Promise: 'es6-promise-promise',
				'window.jQuery': 'jquery'
			}),
			new CopyWebpackPlugin([
				{from: './config/settings.json', to: 'settings.json'},
				{from: './config/robots-allow.txt', to: 'robots.txt'},
				{from: './src/public-pages/assets/css', to: 'assets/css'},
				{from: './src/public-pages/assets/img', to: 'assets/img'}
			]),
			new VueLoaderPlugin(),
			new HtmlWebpackPlugin({
				template: 'src/public-pages/index.html'
			}),
			new BrowserSyncPlugin({
				host: 'localhost',
				port: 3002,
				server: {
					baseDir: './../frontend/build/public-pages',
					index: 'index.html',
					middleware: [
						BrowserSyncSpa(/^[^\.]+$/, __dirname + '/../build/public-pages/index.html')
					]
				},
				files: ['bundle.js', 'assets/**/*.css', 'settings.json'],
				open: false
			}),
			new WebpackOnBuildPlugin(FetchDynamicContent.fetch),
		]
	};
	if (env === 'production') {
		config.optimization = {
			minimizer: [
				new TerserPlugin()
			]
		};
	}
	return config;
};