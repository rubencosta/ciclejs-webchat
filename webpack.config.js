const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = {
  context: path.join(__dirname, 'src'),
  entry: './index.js',
  output: {
    path: path.join(__dirname, '/build'),
    filename: 'bundle.js'
  },
  module: {
    preLoaders: [
      { test: /\.jsx?$/,
        loader: 'eslint-loader'
      }
    ],
    loaders: [
      {test: /\.html/, loader: 'file?name=[name].[ext]'},
      {test: /\.jsx?$/, loader: 'babel', query: {
        cacheDirectory: true,
        presets: ['es2015', 'stage-0', 'react']
      }}
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'cycle.js webchat',
      template: './src/index.tpl.html',
      inject: true
    })
  ]
}
