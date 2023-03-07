const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const webpack = require("webpack");
const version = process.env.VERSION || require('../package.json').version

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    static: {
      directory: path.join(__dirname), // 指定服务器当前域面资源的内容
    },
    // TODO 原理不明白，推测： 这个打开浏览器后会访问那个端口，然后会找index.html那种文件，而下面的HtmlWebpackPlugin刚好生成了index.html，因此达成目标
    open: true, // 自动打开浏览器
    port: 9001, // 端口号
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
      // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.([cm]?ts|tsx)$/, loader: "ts-loader" },
    ],
  },
  plugins: [
    // 直接这样就可以了，这个插件会在生成 的html中的head标签的最后一个子元素上插入一个script标签，引用webpack打包好的js文件，而且这个script是
    // 设置了defer，因此会等后面的dom生成完再执行，满足要求
    new HtmlWebpackPlugin({
      filename: `index.html`, //生成的文件名
      template: path.resolve(__dirname, `src/index.html`), //源文件的绝对路径
    }),
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname, "src"),
      extensions: ["js", "ts"],
      quiet: true // 不报告和处理warning
    }),
    // 使用webpack.DefinePlugin在编译阶段替换变量
    new webpack.DefinePlugin({
      __DEV__: process.env.NODE_ENV !== 'production',
      __VERSION__: version
    })
  ],
};
