const path = require('path');
const slsw = require('serverless-webpack');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  entry: slsw.lib.entries,
  target: 'node',
  externals: [nodeExternals(), 'pg', 'sqlite3', 'pg-hstore'],
  plugins: [
    new webpack.ContextReplacementPlugin(
      /Sequelize(\\|\/)/,
      path.resolve(__dirname, './src'),
    ),
    new webpack.HotModuleReplacementPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './config'),
          to: path.resolve(__dirname, './.webpack/service/config'),
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components/'),
      '@shared': path.resolve(__dirname, 'src/shared/'),
      '@country': path.resolve(__dirname, 'src/country/'),
      '@department-evaluation': path.resolve(
        __dirname,
        'src/department-evaluation/',
      ),
      '@file': path.resolve(__dirname, 'src/file/'),
      '@historical-mean': path.resolve(__dirname, 'src/historical-mean/'),
      '@models': path.resolve(__dirname, 'src/models/'),
      '@port': path.resolve(__dirname, 'src/port/'),
      '@product': path.resolve(__dirname, 'src/product/'),
      '@product-components': path.resolve(__dirname, 'src/product-components/'),
      '@recommendation': path.resolve(__dirname, 'src/recommendation/'),
      '@requirement': path.resolve(__dirname, 'src/requirement/'),
      '@site': path.resolve(__dirname, 'src/site/'),
      '@system': path.resolve(__dirname, 'src/system/'),
      '@tracking': path.resolve(__dirname, 'src/tracking/'),
      '@assets': path.resolve(__dirname, 'assets/'),
      '@config': path.resolve(__dirname, 'config/'),
      '@database': path.resolve(__dirname, 'database/'),
      '@tests': path.resolve(__dirname, 'tests/'),
    },
    extensions: ['.mjs', '.ts', '.js'],
  },
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
};
