const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: 'index.js',
  output: {
    filename: '[name].js',
    path: './build',
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: ['babel-loader'],
    }],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
  ],
};
