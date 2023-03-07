const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
module.exports = {
  // devtool: 'eval-source-map',
  mode: "development",
  devtool: 'inline-source-map',
  // 下面entry的./是整个项目的根目录
  entry: "./src/debugger/index.ts",
  output: {
    filename: "bulid.js",
    path: path.resolve(__dirname, "build"),
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".cjs": [".cjs", ".cts"],
      ".mjs": [".mjs", ".mts"],
    },
  },
  module: {
    rules: [
      {
        test:/\.([cm]?ts|tsx)$/,
        loader:"ts-loader",
        options:{
          // transpileOnly: true
        }
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: `build.html`, //生成的文件名
      template: path.resolve(__dirname, `index.html`), //源文件的绝对路径
    }),
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname),
      extensions: ["js", "ts"],
      quiet: true // 不报告和处理warning
    }),
    new webpack.DefinePlugin({
      __DEV__: process.env.NODE_ENV !== 'production'
    })
  ],
};
