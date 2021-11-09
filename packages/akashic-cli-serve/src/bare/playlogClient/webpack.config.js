const webpack = require("webpack");
const path = require("path");

module.exports = {
	mode: "development",
	target: "node",
	entry: "./src/bare/playlogClient/playlogClientV0_0_0.ts",
	output: {
		path: path.resolve(__dirname, "../../../www/public/external"),
		filename: "playlogClientV0_0_0.js",
		library: "playlogClientV0_0_0",
		libraryTarget: "umd",
		globalObject: "window"
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [
					{
						loader: "ts-loader"
					}
				]
			}
		]
	},
	plugins: [
		new webpack.ProvidePlugin({
			"Promise": "es6-promise"
		})
	]
};
