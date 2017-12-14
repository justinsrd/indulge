'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
	template: './public/index.html',
	filename: 'index.html',
	inject: 'body'
});
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CopyWebpackPluginConfig = new CopyWebpackPlugin([
	{ from: './public/lib' , to: './lib'},
]);

module.exports = {
	entry: './public/App.js',
	output: {
		path: path.resolve('dist'),
		filename: 'bundle.js'
	},
	// devServer: {
	// 	inline: true,
	// 	contentBase: './public',
	// 	port: 4444
	// },
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			}, {
				test: /\.scss$/,
				loader: ['style-loader', 'css-loader','sass-loader']
			},
			{
				test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?/,
				loader: 'file-loader'
			}
		]
	},
	plugins: [
		HtmlWebpackPluginConfig,
		CopyWebpackPluginConfig
	]
};